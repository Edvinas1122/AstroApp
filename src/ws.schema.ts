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


export {MessageSchema}
export type Message = z.infer<typeof ChatMessage>