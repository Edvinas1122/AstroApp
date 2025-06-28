import styles from './Chat.module.css'

type Message = {
	id: string;
	chat: string;
	member: string;
	content: string;
	sent: string | null;
}

import { useEffect, useRef } from "preact/hooks";
import {chat,  members} from "../../../chatStore";
import { useStore } from "@nanostores/preact";

type ChatReq = {
	id: string,
	email: string, // current user email
};

function useLiveChat(id: string) {
	const _members = useStore(members.$members)[id] || []
	const _messages = useStore(chat.$messages)[id] || [];

	useEffect(() => {
		members.fetch(id);
		chat.fetch(id);
	}, [id]);

	return {members: _members, messages: _messages}
}

export function Chat({id, email}: ChatReq) {
	const {members, messages} = useLiveChat(id);
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
		return <Message 
			picture={member.picture}
			sent={message.sent!}
			content={message.content}
			name={member.name}
			my={member.email === email}
		/>;
	}

	function handleSubmit(data: FormData) {
		const content = data.get('content')?.toString();
		if (!content) return ;
		chat.send({chat_id: id, content});
	}

	return (
		<div className={styles.msger}>
			  <header className={styles.msgerHeader}>
				<div className={styles.msgerHeaderTitle}>
				<i class="fas fa-comment-alt"></i> Chat
				</div>
				{/* <div className={styles.msgerStylesOptions}>
				<span><i class="fas fa-cog"></i></span>
				</div> */}
			</header>
			<main className={styles.msgerChat}>
				{messages.map(renderMessage)}
				<div ref={chatEndRef}/>
			</main>
			<Send onSubmit={handleSubmit}/>
		</div>
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


const Send = ({ onSubmit }: { onSubmit: (formData: FormData) => void }) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const formData = new FormData(form);
		onSubmit(formData);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
		return false;
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey && e.currentTarget) {
			e.preventDefault();
			const form = e.currentTarget.form;
			const formData = new FormData(form);
			onSubmit(formData);
			form.reset();
		}
		// Shift+Enter will naturally create new lines
	};

	return (
		<form className={styles.msgerInputarea}>
			<textarea type="text" name="content" placeholder="Enter your message..." 
				className={styles.msgerInput}
				ref={inputRef}
				onKeyDown={handleKeyDown}
			/>
			<button
				className={styles.msgerSendBtn}
			>Send</button>
		</form>
	);
};