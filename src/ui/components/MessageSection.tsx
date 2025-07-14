import type { VNode } from "preact";
import styles from "./Chat.module.css"

type MessageSection<Message> = {
    name: string,
    started: string,
    picture: string,
    my: boolean,
    messages: Message[]
}

type MReq = {
    name: string,
    sent: string,
    picture: string,
    my: boolean,
}

function reduce<
    Message extends MReq
>(messages: Message[]) {
    const reduced = new Array<MessageSection<Message>>();
    
    messages.forEach((message) => {
        const last = reduced.slice(-1)[0]?.name
        if (last === message.name) {
            reduced[reduced.length - 1].messages.push(message)
        } else {
            reduced.push({
                name: message.name,
                started: message.sent,
                my: message.my,
                picture: message.picture,
                messages: [message]
            })
        }
    })

    return reduced;

}

import { Profile } from "./Material";

function render<Message extends MReq>(
    renderMessage: (m: Message) => VNode,
    sections: MessageSection<Message>[],
) {
    const sectionRender = (data: MessageSection<Message>) => (
        <div
            class={`${styles.msgSection} ${data.my ? styles.rightSec : styles.leftSec}`}
        >
            <div style={{display: "flex", gap: "5px", alignItems: "end",
				flexDirection: data.my? "row-reverse": "row"}}>
				<Profile
					src={data.picture}
					alt={data.name+"-profile.icon"}
					/>
				<div style={{display: "flex", gap: "1rem",
						flexDirection: data.my? "row-reverse": "row",
						justifyContent: "space-between",
						alignItems: "center"}}>
					<div class={styles.msgInfoName}>
						{data.name}
					</div>
					<div class={styles.msgInfoTime}>
						{data.started}
					</div>
				</div>
            </div>
            <>
                {data.messages.map(renderMessage)}
            </>
        </div>
    );

    return (
        <>
            {sections.map(sectionRender)}
        </>
    );
}

function MessageSections<
	Message extends MReq
>(props: {
	messages: Message[],
	renderMessage: (message: Message) => VNode,
    emptyDisplay: VNode,
}) {
	const sections = reduce(props.messages);
	return sections.length ? render(props.renderMessage, sections) : props.emptyDisplay
}

function buildMessageSections<
	Message extends MReq
>(
	renderMessage: (props: any) => VNode,
    emptyDisplay: VNode,
) {
	return (props: {messages: Message[]}) => MessageSections({
		renderMessage,
		messages: props.messages,
        emptyDisplay
	})
}

import { MessageBubble } from "./Chat";
import { Center } from "./Material";

const EmptyMessage = (
    <Center
        style={{height: "100%"}}
    ><p>{`🧙 Epic chat starts with a message ✉️`}</p></Center>
)

export const Messages = buildMessageSections(
    MessageBubble,
    EmptyMessage
) 