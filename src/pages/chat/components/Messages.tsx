import styles from './Chat.module.css'
import { useEffect, useRef } from "preact/hooks";
import {messages,  members, chats, $invite_modal, $createChat_modal, route} from "../../../chatStore";
import type { Message, Chat } from '../../../chatStore';
import { useStore } from "@nanostores/preact";

type ChatReq = {
	email: string, // current user email
};

function useLiveChat() {
	const id = useStore(route)[1];
	const _members = useStore(members.$store)[id] || []
	const _messages = useStore(messages.$store)[id] || [];

	useEffect(() => {
		members.fetch(id);
		messages.fetch(id);
	}, [id]);

	return {members: _members, _messages, id}
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

import { createFormAction } from '../../../ui/utils';

export function ChatDisplay({email}: ChatReq) {
	const {members, _messages, id} = useLiveChat();
	const chatEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		scrollToBottom();
	}, [_messages]);

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

	return (
		<>
			<ChatList
				email={email}
			/>
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
				<main className={styles.msgerChat}>
					{_messages.map(renderMessage)}
					<div ref={chatEndRef}/>
				</main>
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
				{members.map((item) => (
					<div>
						<img style={{
							height: "30px",
							borderRadius: "100%"
						}} src={item.user.picture}/>
						{`${item.user.given_name} - ${item.ch_member.role}`}
					</div>
				))}
			</ListBox>
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

	function renderChat(item: Chat) {
		const id = item.chat.id;
		return (
			<div>
				<a 
					onClick={() => window.history.pushState({}, '', `/chat/${id}`)}
				>
					<div>{item.chat.name}</div>
				</a>
				<button
					onClick={() => chats.delete({id})}
				>X</button>
			</div>
		)
	}

	return (
		<>
			<ListBox
				width='200px'
				header={<>Chats</>}
				footer={
					<button onClick={() => $createChat_modal.set(true)}>Create Chat</button>
				}>
				<main className={styles.msgerChat}>
					{_chats.map(renderChat)}
					<div ref={chatEndRef}/>
				</main>
			</ListBox>
		</>
	);
}