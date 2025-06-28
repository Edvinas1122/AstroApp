import { defineAction } from "astro:actions";
import { z } from 'astro:schema';
import type { ChatService } from '../../../api/src';

export const chat = {
	messages: defineAction({
		input: z.object({
			id: z.string(),
			page: z.number()
		}),
		handler: async (input, context) => {
			const chat = context.locals.runtime.env.Chat as unknown as ChatService
			const email = context.locals.user.email;
			return await chat.messages(email, input.id);
		}
	}),
	send: defineAction({
		input: z.object({
			id: z.string(),
			content: z.string(),
		}),
		handler: async (input, context) => {
			const chat = context.locals.runtime.env.Chat as unknown as ChatService
			const email = context.locals.user.email;
			console.log('sending message', email, input.id, input.content);
			const response = await chat.send(email, input.id, input.content);
			console.log("response:", response);
			// console.log(await callRPC(chat, 'send', email, input.chat_id, input.content));
			return response;
			// return await chat.send(email, input.chat_id, input.content);
		}
	}),
	members: defineAction({
		input: z.object({
			id: z.string(),
			page: z.number()
		}),
		handler: async (input, context) => {
			const chat = context.locals.runtime.env.Chat as unknown as ChatService
			const email = context.locals.user.email;

			return await chat.members(email, input.id);
		}
	})
}

function callRPC<
  T extends object,
  K extends keyof T,
  F extends T[K] & ((...args: any[]) => any) // <-- explicitly ensure it's a function
>(
  service: T,
  method: K,
  ...args: Parameters<F>
): ReturnType<F> | void {
  try {
    const fn = service[method] as F;
    return fn.apply(service, args);
  } catch (error: any) {
    console.error(error.message);
	return error.message
  }
}