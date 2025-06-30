import { z, type ZodTypeAny, ZodObject, ZodString } from 'astro:schema';
import type { ChatService } from '../../../api/src';
import { createServiceActionBuilder } from "./utils";

const chatAction = createServiceActionBuilder<ChatService>(
	(context) => context.locals.runtime.env.Chat
)

const paginate = z.object({
	id: z.string(),
	page: z.number()
})

const one = <T extends Record<string, ZodTypeAny>>(props: T): ZodObject<{
  id: ZodString;
} & T> => {
  return z.object({
    id: z.string(),
    ...props,
  });
};

export const chat = {
	chats: chatAction(paginate, async (input, {service, email}) => {
		return await service.list(email);
	}),
	create: chatAction(z.object({
		name: z.string().max(15)
	}), async (input, {service, email}) => {
		return await service.create(email, input.name);
	}),
	delete: chatAction(one({}), async (input, {service, email}) => {
		return await service.delete(email, input.id);
	}),
	messages: chatAction(paginate, async (input, {service, email}) => {
		return await service.messages(email, input.id);
	}),
	send: chatAction(one({content: z.string()}),
		async (input, {service, email}) => {
			return await service.send(email, input.id, input.content);
	}),
	members: chatAction(paginate, async (input, {service, email}) => {
			return await service.members(email, input.id);
	}),
	invite: chatAction(one({user: z.string()}),
		async (input, {service, email}) => {
			return await service.invite(email, input.id, input.user);
	}),
	accept: chatAction(one({
	}), async (input, {service, email}) => {
		return await service.accept(email, input.id)
	})
}
