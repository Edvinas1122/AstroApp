// import { useEffect } from "preact/hooks";
// import {messages, members, chats, $invite_modal, route, my_email} from "@script/stores";
// import type { Message, Member } from '@script/stores';
// import { useStore } from "@nanostores/preact";

// function isPermitableChat(id: string) {
// 	const _chats = useStore(chats.$store)['default'] || [];

// 	return {permited: !!_chats.filter(c => c.id === id).length, loading: _chats.loading}
// }

// function useLiveChat() {
// 	const id = useStore(route)[1];
// 	const {permited, loading} = isPermitableChat(id);
// 	const _members = useStore(members.$store)[id] || []
// 	const _messages = useStore(messages.$store)[id] || [];
// 	const _my_email = useStore(my_email);

// 	useEffect(() => {
// 		if (id && permited) {
// 			members.fetch(id);
// 			messages.fetch(id);
// 		}
// 	}, [id, permited]);

// 	const _loading = loading || _members.loading || _messages.loading

// 	return {_members, _messages, id, permited, email: _my_email, loading: _loading}
// }

// import { createFormAction } from '@root/src/script/Form';
// import { Center } from '@root/src/ui/components/Material';
// import { WritingArea } from '@root/src/ui/components/Chat';
// import MessagesView, {type MessagesViewReq} from "@root/src/ui/views/Messages";
// import MembersView from "@root/src/ui/views/Members";

// function messagesReduce(
// 	messages: Message[],
// 	members: Member[],
// 	email: string
// ): MessagesViewReq["messages"] {
// 	function reduce(message: Message) {
// 		const member = members.find(mem => mem.id === message.member)
// 		if (!member) {
// 			console.warn("chat contains a message not of a member");
// 			return null;
// 		}
// 		return {
// 			picture: member.picture,
// 			sent: message.sent,
// 			content: message.content,
// 			name: member.name,
// 			my: member.user === email,
// 			file: message.file
// 		}
// 	}
// 	return messages.map(reduce).filter(m => !!m)
// }

// export function ChatDisplay() {
// 	const {
// 		loading,
// 		_members,
// 		_messages,
// 		id, permited, email
// 	} = useLiveChat();

// 	if (!email || loading) return <Center><p>loading...</p></Center>
// 	if (!id) return (<Center><p>Start chat by selecting or creating one</p></Center>)

// 	const submit = createFormAction([
// 		'content',
// 		{type: 'file', name: 'attachment'}
// 	], ({content, attachment}, reset) => {
// 		const file = attachment.size ? attachment : null;
// 		messages.send({id, content, file}, email); reset();
// 	})



// 	const ChatPort = (
// 		<>
// 		<MessagesView
// 			messages={messagesReduce(_messages, _members, email)}
// 			name={id}
// 			typer={
// 				<WritingArea
// 					onSubmit={(e) => submit(e)}
// 					submit={(form) => submit.form(form)}
// 				/>
// 			}
// 		/>
// 		{/* <MembersView
// 			members={_members}
// 			invite={<>
// 				<button onClick={() => $invite_modal.set(true)}>Invite users</button>
// 			</>}
// 		/> */}
// 		</>
// 	)


// 	return (
// 		<>
// 			{ChatPort}
// 		</>
// 	);
// }
