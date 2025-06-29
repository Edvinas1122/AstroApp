import { defineAction } from "astro:actions";
import { z } from 'astro:schema';
import type { UserService } from '../../../api/src';

export const user = {
	search: defineAction({
		input: z.object({
			query: z.string()
		}),
		handler: async (input, context) => {
			const user = context.locals.runtime.env.User as  unknown as UserService;
			const email = context.locals.user.email;

			const data = await user.list();
			return data;
		}
	})
}