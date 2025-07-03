import { useEffect, useRef } from "preact/hooks";
import {messages, members, chats, $invite_modal, $createChat_modal, route} from "@root/src/chatStore";
import type { Message, Chat, Member } from '@root/src/chatStore';
import { useStore } from "@nanostores/preact";

type ChatReq = {
	email: string,
};

function isPermitableChat(id: string) {
	const _chats = useStore(chats.$store)['default'] || [];

	return !!_chats.filter(c => c.chat.id === id).length
}

function useLiveChat() {
	const id = useStore(route)[1];
	const permited = isPermitableChat(id);
	const _members = useStore(members.$store)[id] || []
	const _messages = useStore(messages.$store)[id] || [];

	useEffect(() => {
		if (id && permited) {
			members.fetch(id);
			messages.fetch(id);
		}
	}, [id, permited]);

	return {_members, _messages, id, permited}
}

import { createButtonEvent, createFormAction } from '@root/src/script/Form';
import { Center } from '@ui/Material';
import { ListBox, ChatUserMini, MessageBox, WritingArea } from '@ui/Chat';

export function ChatDisplay({email}: ChatReq) {
	const {_members, _messages, id, permited} = useLiveChat();
	const chatEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		scrollToBottom();
	}, [_messages]);

	const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

	function selectMember(id: string) {
		return _members.find((item) => item.ch_member.id === id)?.user;
	}

	function renderMessage(message: Message) {
		const member = selectMember(message.member);
		if (!member) {
			console.log("member not found", message.member)
			return null;
		}
		return <MessageBox 
			picture={member.picture}
			sent={message.sent!}
			content={message.content}
			name={member.name}
			my={member.email === email}
		/>;
	}

	const submit = createFormAction(['content'], ({content}, reset) => {
		messages.send({id, content}, email); reset();
	})

	const _name = id && id.split(':').filter(a => a.length)[0]

	const admins = _members.filter(memb => memb.ch_member.role === 'admin');
	const participants = _members.filter(memb => memb.ch_member.role === 'participant');
	const invited = _members.filter(memb => memb.ch_member.role === 'invited');

	const my_role = _members.find((memb) => memb.user.email === email)?.ch_member.role

	const renderAdmin = (item: Member) => <ChatUserMini 
			picture={{url: item.user.picture, alt: `profile-icon-${item.user.given_name}`}}
			name={item.user.given_name}
			online={item.online}
	/>;

	const ChatPort = (
		<>
		<ListBox
			width='1000px'
			header={<><i class="fas fa-comment-alt"></i>{`${_name} - chat`}</>}
			footer={
				<WritingArea
					onStroke={(e) => submit.stroke(e)}
					onSubmit={(e) => submit(e)}
				/>
			}
			>
				{!!_messages.length ? <>
					{_messages.map(renderMessage)}
					<div ref={chatEndRef}/>
				</> : (<Center><p>{`🧙 Epic ${_name} chat starts with a message ✉️`}</p></Center>)}
		</ListBox>
		<ListBox
			width='200px'
			header={<>Members</>}
			footer={
				<>
					<button onClick={() => $invite_modal.set(true)}>Invite users</button>
				</>
			}
		>
			{_members.length > 1 ? <><section>
				<p>Admin</p>
				{admins.map(renderAdmin)}
			</section>
			{!!participants.length && <section>
				<p>Participants</p>
				{participants.map(renderAdmin)}
			</section>}
			{!!invited.length && <section>
				<p>Invited</p>
				{invited.map(renderAdmin)}
			</section>}</> : (<Center><p>Invite wonderers to chat with them</p></Center>)}
		</ListBox>
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
		const id = item.chat.id;
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
					<div>{item.chat.name}</div>
				</p>
				{interact(id)}
			</div>
		)
	}

	const myChats = _chats.filter(chat => chat.ch_member.role === 'admin');
	const participantChats = _chats.filter(chat => chat.ch_member.role === 'participant');
	const invited = _chats.filter(chat => chat.ch_member.role === 'invited');

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
						{participantChats.map(renderMyChat)}
					</section>}
					{/* <div ref={chatEndRef}/> */}
				</>
			</ListBox>
		</>
	);
}