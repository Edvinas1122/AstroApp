import { defineAction } from "astro:actions";
import { z } from 'astro:schema';
import { createServiceActionBuilder } from "./utils";

const userAction = createServiceActionBuilder(
	(context) => context.locals.runtime.env.User
)

const socketAction = createServiceActionBuilder(
	(c) => c.locals.runtime.env.WebSocket
)

export const user = {
	search: userAction(
		z.object({
			query: z.string()
		}), 
		async ({query}, {service}) => await service.list()
	),
	online: socketAction(z.object({}),
		async (_, {service}) => await service.onlineCount()
	),
}