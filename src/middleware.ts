import { defineMiddleware } from "astro:middleware";
import type { MiddlewareHandler, MiddlewareNext, APIContext } from "astro";
import type { UserService } from "../../api/src";

const auth_routes = [
	"/chat",
	"/socket"
]

export const onRequest = defineMiddleware(
	withToken(
		auth_routes,
		'token',
		async (token, context, next) => {
			const user = context.locals.runtime.env.User as unknown as UserService;
			const user_data = await user.verify(token);
			if ('message' in user_data) return RedirectAuth();
			context.locals.user = {
				email: user_data.payload.email
			}
			return next();
	})
);

function withToken(
	guardRoutes: string[],
	tokenName: string,
	handleValidation: (token: string, context: APIContext, next: MiddlewareNext) => Promise<Response>
): MiddlewareHandler {
	return async function (context, next) {
		const route = new URL(context.url).pathname;
		if (auth_routes.some((_route) => route.startsWith(_route))) {
			const cookie = context.cookies.get('token')?.value;
			if (!cookie) return RedirectAuth();
			return await handleValidation(cookie, context, next);
		}
		return next()
	}
}

function RedirectAuth() {
	return new Response('', {
		status: 302,
		headers: {
			location: '/?auth=require_login'
		}
	})
}