import { defineAction } from "astro:actions";
import { z } from 'astro:schema';
import type { UserService, SocketUtilsService } from '../../../api/src';
import { createServiceActionBuilder } from "./utils";

const userAction = createServiceActionBuilder<UserService>(
	(context) => context.locals.runtime.env.User
)

const socketAction = createServiceActionBuilder<SocketUtilsService>(
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
	)
}