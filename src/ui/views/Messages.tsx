import { useEffect, useRef } from "preact/hooks";
import type { VNode } from "preact";
import { ListBox, MessageBox, type MessageProps } from '@ui/components/Chat';
import { Center } from '@ui/components/Material';

export interface MessagesViewReq {
	messages: MessageProps[]
	name: string,
	typer: VNode
}

export default function MessagesView({
	messages,
	name,
	typer
}: MessagesViewReq) {
	const chatEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const scrollToBottom = () => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const renderMessage = (message: MessageProps) => <MessageBox {...message}/> 

	const _name = name && name.split(':').filter(a => a.length)[0]

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