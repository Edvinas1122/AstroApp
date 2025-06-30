import styles from './Chat.module.css'
import { useEffect, useRef } from "preact/hooks";
import {messages, members, chats, $invite_modal, $createChat_modal, route} from "../../../chatStore";
import type { Message, Chat, Member } from '../../../chatStore';
import { useStore } from "@nanostores/preact";

type ChatReq = {
	email: string, // current user email
};

function useLiveChat() {
	const id = useStore(route)[1];
	const _members = useStore(members.$store)[id] || []
	const _messages = useStore(messages.$store)[id] || [];

	useEffect(() => {
		if (id) {
			members.fetch(id);
			messages.fetch(id);
		}
	}, [id]);

	return {_members, _messages, id}
}
import type { VNode } from 'preact';

interface ListBoxProps {
    header?: VNode | string;
    children?: VNode | VNode[];
    footer?: VNode;
    class?: string;
	width?: string
}

const ListBox = ({ header, children, footer, class: className = '', width }: ListBoxProps) => (
    <div class={`${styles.msger} ${className}`} 
		style={{
			maxWidth: width
		}}
	>
        {header && (
            <header class={styles.msgerHeader}>
                {typeof header === 'string' ? (
                    <div class={styles.msgerHeaderTitle}>
                        {header}
                    </div>
                ) : (
                    header
                )}
            </header>
        )}
        
        <main class={styles.msgerChat}>
            {children}
        </main>
        
        {footer && (
            <footer class={styles.msgerInputArea}>
                {footer}
            </footer>
        )}
    </div>
);


const MemberC = ({item, children}:{item: Member, children?: ChildNode}) => (
	<div>
		<img style={{
			height: "30px",
			borderRadius: "100%"
		}} src={item.user.picture}/>
		{item.user.given_name}
		{children}
	</div>
)

import { createFormAction } from '../../../ui/utils';

export function ChatDisplay({email}: ChatReq) {
	const {_members, _messages, id} = useLiveChat();
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
		return <Message 
			picture={member.picture}
			sent={message.sent!}
			content={message.content}
			name={member.name}
			my={member.email === email}
		/>;
	}

	const submit = createFormAction(['content'], ({content}) => {
		messages.send({id, content});
	})



	const admins = _members.filter(memb => memb.ch_member.role === 'admin');
	const participants = _members.filter(memb => memb.ch_member.role === 'participant');
	const invited = _members.filter(memb => memb.ch_member.role === 'invited');

	const my_role = _members.find((memb) => memb.user.email === email)?.ch_member.role

	const renderAdmin = (item: Member) => (
		<MemberC item={item}/>
	);

	const ChatPort = (
		<>
		<ListBox
			width='1000px'
			header={<><i class="fas fa-comment-alt"></i> Chat</>}
			footer={
				<form className={styles.msgerInputarea} onSubmit={submit}>
					<textarea name="content" placeholder="Enter your message..." 
						className={styles.msgerInput}
						onKeyDown={submit.stroke}
					/>
					<button
						className={styles.msgerSendBtn}
					>Send</button>
				</form>
				}
			>
				{!!_messages.length ? <main className={styles.msgerChat}>
					{_messages.map(renderMessage)}
					<div ref={chatEndRef}/>
				</main> : (<div><p>🧙 Epic chat starts with a message ✉️</p></div>)}
		</ListBox>
		<ListBox
			width='200px'
			header={<>Members</>}
			footer={
				<>
					<a onClick={() => $invite_modal.set(true)}>Invite users</a>
				</>
			}
		>
			<>
			<section>
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
			</section>}
			</>
		</ListBox>
		</>
	)

	return (
		<>
			<ChatList
				email={email}
			/>
			{id ? ChatPort : (<div><p>Start chat by selecting or creating one</p></div>)}
		</>
	);
}


type MessageProps = {
	name: string,
	picture: string,
	sent: string,
	content: string,
	my: boolean
}

const Message = ({ name, picture, sent, content, my }: MessageProps) => (
    <div className={`${styles.msg} ${my ? styles.rightMsg : styles.leftMsg}`}>
        <img
			class={styles.msgImg}
			src={picture}
			alt={name}
		/>
		<div className={styles.msgBubble}>
			<div class={styles.msgInfo}>
        		<div class={styles.msgInfoName}>{name}</div>
        		<div class={styles.msgInfoTime}>{sent}</div>
        	</div>
        	<div class={styles.msgText}>{content}</div>
		</div>
    </div>
);

interface ChatListProps {
	email: string
}

function ChatList({email}: ChatListProps) {
	const _chats = useStore(chats.$store)['default'] || [];
	const chatEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		chats.fetch('default');
	}, [email])

	const renderChat = (interact: (id: string) => VNode) => (item: Chat) => {
		const id = item.chat.id;
		return (
			<div>
				<a 
					onClick={() => window.history.pushState({}, '', `/chat/${id}`)}
				>
					<div>{item.chat.name}</div>
				</a>
				{interact(id)}
			</div>
		)
	}

	const myChats = _chats.filter(chat => chat.ch_member.role === 'admin');
	const participantChats = _chats.filter(chat => chat.ch_member.role === 'participant');
	const invited = _chats.filter(chat => chat.ch_member.role === 'invited');

	const renderMyChat = renderChat((id) =>	
		<button
			onClick={() => chats.delete({id})}
		>Delete</button>
	);

	const renderInvitedChats = renderChat((id) => <div>
		<button
			onClick={() => chats.accept({id})}
		>

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
				<main className={styles.msgerChat}>
					{!!invited.length && <section>
						<p>Invited</p>
						{invited.map(renderMyChat)}
					</section>}
					{!!myChats.length && <section>
						<p>My Chats</p>
						{myChats.map(renderMyChat)}
					</section>}
					{!!participantChats.length && <section>
						<p>Participant</p>
						{participantChats.map(renderMyChat)}
					</section>}
					<div ref={chatEndRef}/>
				</main>
			</ListBox>
		</>
	);
}