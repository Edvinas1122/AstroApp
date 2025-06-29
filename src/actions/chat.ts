import { z } from 'astro:schema';
import type { ChatService } from '../../../api/src';
import { createServiceActionBuilder } from "./utils";

const chatAction = createServiceActionBuilder<ChatService>(
	(context) => context.locals.runtime.env.Chat
)

const paginate = z.object({
	id: z.string(),
	page: z.number()
})

export const chat = {
	chats: chatAction(paginate, async (input, {service, email}) => {
		return await service.list(email);
	}),
	create: chatAction(z.object({
		name: z.string().max(15)
	}), async (input, {service, email}) => {
		return await service.create(email, input.name);
	}),
	delete: chatAction(z.object({id: z.string()}), async (input, {service, email}) => {
		return await service.delete(email, input.id);
	}),
	messages: chatAction(paginate, async (input, {service, email}) => {
		return await service.messages(email, input.id);
	}),
	send: chatAction(z.object({id: z.string(), content: z.string()}),
		async (input, {service, email}) => {
			return await service.send(email, input.id, input.content);
	}),
	members: chatAction(paginate, async (input, {service, email}) => {
			return await service.members(email, input.id);
	}),
	invite: chatAction(z.object({id: z.string(), user: z.string()}),
		async (input, {service, email}) => {
			return await service.sign(email, input.id, input.user);
	})
}
