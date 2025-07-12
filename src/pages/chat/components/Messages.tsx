import { useEffect, useRef } from "preact/hooks";
import {messages, members, chats, $invite_modal, $createChat_modal, route, my_email} from "@script/stores";
import type { Message, Chat, Member } from '@script/stores';
import { useStore } from "@nanostores/preact";

function isPermitableChat(id: string) {
	const _chats = useStore(chats.$store)['default'] || [];

	return !!_chats.filter(c => c.id === id).length
}

function useLiveChat() {
	const id = useStore(route)[1];
	const permited = isPermitableChat(id);
	const _members = useStore(members.$store)[id] || []
	const _messages = useStore(messages.$store)[id] || [];
	const _my_email = useStore(my_email);

	useEffect(() => {
		if (id && permited) {
			members.fetch(id);
			messages.fetch(id);
		}
	}, [id, permited]);

	return {_members, _messages, id, permited, email: _my_email}
}

import { createButtonEvent, createFormAction } from '@root/src/script/Form';
import { Center } from '@ui/Material';
import { ListBox, ChatUserMini, MessageBox, WritingArea } from '@ui/Chat';
import type { VNode } from "preact";

export function ChatDisplay() {
	const {
		_members,
		_messages,
		id, permited, email
	} = useLiveChat();

	if (!email) return <Center><p>loading...</p></Center>

	const submit = createFormAction([
		'content',
		{type: 'file', name: 'attachment'}
	], ({content, attachment}, reset) => {
		const file = attachment.size ? attachment : null;
		messages.send({id, content, file}, email); reset();
	})

	const ChatPort = (
		<>
		<MessagesView
			members={_members}
			messages={_messages}
			id={id}
			email={email}
			typer={
				<WritingArea
					onSubmit={(e) => submit(e)}
					submit={(form) => submit.form(form)}
				/>
			}
		/>
		<MembersView
			members={_members}
			invite={<>
				<button onClick={() => $invite_modal.set(true)}>Invite users</button>
			</>}
		/>
		</>
	)

	return (
		<>
			<ChatList
				email={email}
			/>
			{id ? !permited ? (<Center><p>404 Not Found</p></Center>) : ChatPort : (<Center><p>Start chat by selecting or creating one</p></Center>)
			}
		</>
	);
}

interface MessagesViewReq {
	messages: Message[],
	members: Member[],
	email: string,
	id: string,
	typer: VNode
}

function MessagesView({
	members,
	messages,
	email,
	id,
	typer
}: MessagesViewReq) {

	const chatEndRef = useRef<HTMLDivElement>(null);


	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

	function selectMember(id: string) {
		return members.find((item) => item.ch_member.id === id)?.user;
	}

	function renderMessage(message: Message) {
		const member = selectMember(message.member);
		if (!member) {
			console.log("member not found", message.member)
			return null;
		}
		console.log('rendering message', message);
		return <MessageBox 
			picture={member.picture}
			sent={message.sent!}
			content={message.content}
			name={member.name}
			my={member.email === email}
			file={message.file}
		/>;
	}

	const _name = id && id.split(':').filter(a => a.length)[0]

	return (
		<ListBox
			width='1000px'
			header={<><i class="fas fa-comment-alt"></i>{`${_name} - chat`}</>}
			footer={typer}
			>
				{!!messages.length ? <>
					{messages.map(renderMessage)}
					<div ref={chatEndRef}/>
				</> : (<Center><p>{`🧙 Epic ${_name} chat starts with a message ✉️`}</p></Center>)}
		</ListBox>
	)
}

interface MembersViewReq {
	members: Member[],
	invite: VNode
}

function MembersView({
	members,
	invite
}: MembersViewReq) {

	const admins = members.filter(memb => memb.ch_member.role === 'admin');
	const participants = members.filter(memb => memb.ch_member.role === 'participant');
	const invited = members.filter(memb => memb.ch_member.role === 'invited');

	const renderMember = (item: Member) => <ChatUserMini 
			picture={{url: item.user.picture, alt: `profile-icon-${item.user.given_name}`}}
			name={item.user.given_name}
			online={item.online}
	/>;

	return (
		<ListBox
			width='200px'
			header={<>Members</>}
			footer={invite}
		>
			{members.length > 1 ? <><section>
				<p>Admin</p>
					{admins.map(renderMember)}
				</section>
				{!!participants.length && <section>
					<p>Participants</p>
					{participants.map(renderMember)}
				</section>}
				{!!invited.length && <section>
					<p>Invited</p>
					{invited.map(renderMember)}
				</section>}</> 
				: (<Center><p>Invite wonderers to chat with them</p></Center>)
			}
		</ListBox>
	)
}


interface ChatListProps {
	email: string
}

function ChatList({email}: ChatListProps) {
	const _chats = useStore(chats.$store)['default'] || [];
	// const chatEndRef = useRef<HTMLDivElement>(null);
	const currentSelect = useStore(route)[1];
	
	useEffect(() => {
		chats.fetch('default');
	}, [email])


	const renderChat = (interact: (id: string) => VNode) => (item: Chat) => {
		const id = item.id;
		const selected = id === currentSelect;
		const link = () => window.history.pushState({}, '', `/chat/${id}`);
		return (
			<div
				style={{
					boxShadow: selected ? '0 0 0 2px #3b82f6' : 'none',
					backgroundColor: selected ? '#eff6ff' : 'transparent',
					borderRadius: '8px',
					padding: '12px',
					margin: '4px 0',
					transition: 'all 0.2s ease',
					cursor: 'pointer',
					// Add other styles as needed
				}}
				onClick={link}
			>
				<p>
					<>{item.name}</>
				</p>
				{interact(id)}
			</div>
		)
	}

	const myChats = _chats.filter(chat => chat.my_role === 'admin');
	const participantChats = _chats.filter(chat => chat.my_role === 'participant');
	const invited = _chats.filter(chat => chat.my_role === 'invited');

	const renderMyChat = renderChat((id) =>	{
		const action = createButtonEvent((e, reset) => {
			e.stopPropagation();
			chats.delete({id}).then(() => {
				reset();
				if (currentSelect === id) {
					window.history.replaceState({}, '', '/chat')
				}
			})
		})
		return	<button
					disabled={action.loading}
					onClick={action}
			>Delete</button>
		
	});

	const renderInvitedChats = renderChat((id) => <div>
		<button
			onClick={() => chats.accept({id}).then(e => {

			})}
		>
			Accept
		</button>
	</div>)

	const renderParticipantChats = renderChat((id) => <div>
		<button
			onClick={() => chats.leave({id})}
		>
			Leave
		</button>
	</div>)

	return (
		<>
			<ListBox
				width='200px'
				header={<>Chats</>}
				footer={
					<button onClick={() => $createChat_modal.set(true)}>Create Chat</button>
				}>
				<>
					{!!invited.length && <section>
						<p>{`Invited (${invited.length})`}</p>
						{invited.map(renderInvitedChats)}
					</section>}
					{!!myChats.length && <section>
						<p>{`My Chats (${myChats.length})`}</p>
						{myChats.map(renderMyChat)}
					</section>}
					{!!participantChats.length && <section>
						<p>{`Participants (${participantChats.length})`}</p>
						{participantChats.map(renderParticipantChats)}
					</section>}
					{/* <div ref={chatEndRef}/> */}
				</>
			</ListBox>
		</>
	);
}