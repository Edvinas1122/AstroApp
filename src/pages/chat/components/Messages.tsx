import { useEffect } from "preact/hooks";
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
import { Center } from '@root/src/ui/components/Material';
import { ListBox, ChatUserMini, WritingArea } from '@root/src/ui/components/Chat';
import type { VNode } from "preact";
import MessagesView, {type MessagesViewReq} from "@root/src/ui/views/Messages";
import MembersView from "@root/src/ui/views/Members";

function messagesReduce(
	messages: Message[],
	members: Member[],
	email: string
): MessagesViewReq["messages"] {
	function reduce(message: Message) {
		const member = members.find(mem => mem.ch_member.id === message.member)!.user
		return {
			picture: member.picture,
			sent: message.sent,
			content: message.content,
			name: member.name,
			my: member.email === email,
			file: message.file
		}
	}
	return messages.map(reduce);
}

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
			messages={messagesReduce(_messages, _members, email)}
			name={id}
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
			{id ? !permited ? (<Center><p>404 Not Found</p></Center>) : ChatPort : (<Center><p>Start chat by selecting or creating one</p></Center>)
			}
		</>
	);
}
