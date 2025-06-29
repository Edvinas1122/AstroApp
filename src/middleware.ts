import { defineMiddleware } from "astro:middleware";
import type { MiddlewareHandler, MiddlewareNext, APIContext } from "astro";
import type { UserService } from "../../api/src";

export const prerender = false;


const auth_routes = [
	"/chat",
	"/socket",
	'/_actions'
]

export const onRequest = defineMiddleware(
	// withLog(
		withToken(
			auth_routes,
			'token',
			async (token, context, next) => {
				// console.log('middleware call', context.url);
				const user = context.locals.runtime.env.User as unknown as UserService;
				const user_data = await user.verify(token);
				if ('message' in user_data) return Redirect('/?auth=require_login');
				context.locals.user = {
					email: user_data.payload.email
				}
				return next();
		})
// )
);

function withToken(
	guardRoutes: string[],
	tokenName: string,
	handleValidation: (token: string, context: APIContext, next: MiddlewareNext) => Promise<Response>
): (context: APIContext, next: MiddlewareNext) => Promise<Response> {
	return async function (context, next) {

		const route = new URL(context.url).pathname;
		const cookie = context.cookies.get(tokenName)?.value;
		if (guardRoutes.some((_route) => route.startsWith(_route))) {
			if (!cookie) return Redirect('/?auth=require_login');
			return await handleValidation(cookie, context, next);
		} else if (cookie && route === '/' && new URL(context.url).searchParams.get('auth') !== "require_login") {
			return Redirect('/chat');
		}
		return next();
	}
}

function Redirect(location: string) {
	return new Response('', {
		status: 302,
		headers: {
			location
		}
	})
}

function withLog(
	inner: (context: APIContext, next: MiddlewareNext) => Promise<Response>
): MiddlewareHandler {
	return async function (context, next) {
		const response = inner(context, next);
		// collectRequestInfo(context.request);
		return response;
	}
}

import { z } from 'zod';



const cfHeadersSchema = z.object({
  'cf-connecting-ip': z.string().ip().optional(), // or z.string() if you just want a string
  'cf-ipcountry': z.string().length(2).optional(), // country code like 'DE'
  'cf-ray': z.string().optional(),
  'cf-visitor': z
    .string()
    .transform((str) => JSON.parse(str))
    .pipe(
      z.object({
        scheme: z.enum(['http', 'https', 'wss', 'ws']),
      })
    )
    .optional(),
  'cf-warp-tag-id': z.string().uuid().optional(),
  'user-agent': z.string().min(1).optional(),
});

function collectRequestInfo(request: Request) {
	const rawHeaders = Object.fromEntries(
		[...request.headers.entries()].map(([k, v]) => [k.toLowerCase(), v])
	);
	const connection_info = cfHeadersSchema.parse(rawHeaders)
	// console.log(connection_info)

} 