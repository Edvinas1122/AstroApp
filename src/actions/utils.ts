import type { ActionAPIContext } from "astro:actions";
import type { MaybePromise } from "astro/actions/runtime/utils.js";
import { defineAction, type ActionHandler } from "astro:actions";
import {z} from 'zod';

function createServiceActionBuilder<Service>(
	getService: (context: ActionAPIContext) => Service
) {
	function actionBuilder<Schema extends z.ZodTypeAny>(
		schema: Schema,
		handler: (input: z.infer<Schema>, params: { email: string; service: Service; context: ActionAPIContext }) => MaybePromise<any>
	) {
		return defineAction({
			input: schema,
			handler: async (input, context) => {
				const service = getService(context);
				const email = context.locals.user.email;
				try {
					return await handler(input, { email, service, context });
				} catch (error: any) {
					return {error: error.message}
				}
			},
		} as { input: Schema; handler: ActionHandler<Schema, unknown> });
	}
	return actionBuilder;
}

export {createServiceActionBuilder}