import {z} from "zod";

// Define each message type's structure
const SystemMessage = z.object({
  type: z.literal('system'),
  content: z.object({
    info: z.string(),
	user: z.string().optional()
  }),
});

const ChatMessage = z.object({
  type: z.literal('chat'),
  content: z.object({
    // chat_id: z.string(),

		content: z.string(),
		member: z.string(),
		sent: z.string(),
		id: z.string(),
		chat: z.string()
  }),
});

const EventMessage = z.object({
  type: z.literal('event'),
  content: z.object({
    eventName: z.string(),
    payload: z.record(z.any()),
  }),
});

const MessageSchema = z.discriminatedUnion('type', [
  SystemMessage,
  ChatMessage,
  EventMessage,
]);

type Handler = (ws: WebSocket, message: any) => any


const handlers = new Map<string, Handler>();

handlers.set('system', (ws, m) => {
	console.log('system message received:', m);
});


import { chat } from "./chatStore";

handlers.set('chat', (ws, m: z.infer<typeof ChatMessage>['content']) => {
	chat.receive(m);
	// chat.set(m.message.chat, m.message)
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
		console.error("web socket parse error:",e.message);
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
