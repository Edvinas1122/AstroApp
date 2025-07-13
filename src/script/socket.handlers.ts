import { MessageSchema, type Message, type Invite } from "./socket.schema";

type Handler = (ws: WebSocket, message: any) => any

const handlers = new Map<string, Handler>();

handlers.set('system', (ws, m) => {
	console.log('system message received:', m);
});


import { messages, chats } from "./stores";

handlers.set('chat', (ws, m: Message['content']) => {
	messages.receive(m);
	// chat.set(m.message.chat, m.message)
})

handlers.set('invite', (ws, m: Invite['content']) => {
	chats.receive({ch_member: m.ch_member, chat: m.chat})
})

export const onMessage = (ws: WebSocket) => (message: MessageEvent) => {

	console.log('received message')
	try {
		const data = JSON.parse(message.data)
		console.log(data)
		const _message = MessageSchema.parse(data)
		const handler = handlers.get(_message.type);
		if (handler) {
			handler(ws, _message.content);
		}
	} catch (e: any) {
		console.warn("web socket parse error:",e.message);
	}
}

export const onConnect = (ws: WebSocket) => () => {
	ws.send(JSON.stringify({
		type: 'system',
		content: {
			info: 'test'
		}
	}))
}
