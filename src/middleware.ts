import { defineMiddleware } from "astro:middleware";
import type { MiddlewareHandler } from "astro";
import type { UserService } from "../../api/src";
import { sequence } from "astro:middleware";

export const prerender = false;


const auth_routes = [
	"/chat",
	"/socket",
	'/_actions'
]

const routesHandler = (
	routes: string[],
	handler: MiddlewareHandler,
	elseHandler?: MiddlewareHandler
) => defineMiddleware((c, next) => {
	const route = new URL(c.url).pathname;
	if (routes.some((_route) => route.startsWith(_route))) {
		return handler(c, next);
	} else if (elseHandler) {
		return elseHandler(c, next);
	}
	return next();
})

const token_name = 'token'

const markAuthorized = routesHandler(
	auth_routes,
	defineMiddleware(async (c, next) => {
		const cookie = c.cookies.get(token_name)?.value;
		const user = c.locals.runtime.env.User as unknown as UserService;
		c.locals.user = {authorized: false};
		if (!cookie) {
			return next();
		}
		const user_data = await user.verify(cookie);
		if ('message' in user_data) {
			return next();
		}
		c.locals.user = {
				authorized: true,
				email: user_data.payload.email
		}
		return next();
	}),
	defineMiddleware((c, n) => {
		c.locals.user = {authorized: true};
		c.locals.user.authorized = true;
		return n();
	})
)

const handleUnauthorized = defineMiddleware((c, n) => {
	if (!c.locals.user.authorized) {
		return routesHandler(
			['/chat'],
			() => Redirect('/auth'),
			() => Json({error: 'token not authorized'}, 401),
		)(c, n)
	}
	return n();
})

const redirectRoot = defineMiddleware((c, n) => {
	if (c.url.pathname === '/') return Redirect('/chat');
	return n();
})

export const onRequest = sequence(redirectRoot, markAuthorized, handleUnauthorized);


function Redirect(location: string) {
	return new Response('', {
		status: 302,
		headers: {
			location
		}
	})
}

function Json(data: Record<string, any>, status: number) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
		},
    });
}

// function withLog(
// 	inner: (context: APIContext, next: MiddlewareNext) => Promise<Response>
// ): MiddlewareHandler {
// 	return async function (context, next) {
// 		const response = inner(context, next);
// 		// collectRequestInfo(context.request);
// 		return response;
// 	}
// }

// import { z } from 'zod';



// const cfHeadersSchema = z.object({
//   'cf-connecting-ip': z.string().ip().optional(), // or z.string() if you just want a string
//   'cf-ipcountry': z.string().length(2).optional(), // country code like 'DE'
//   'cf-ray': z.string().optional(),
//   'cf-visitor': z
//     .string()
//     .transform((str) => JSON.parse(str))
//     .pipe(
//       z.object({
//         scheme: z.enum(['http', 'https', 'wss', 'ws']),
//       })
//     )
//     .optional(),
//   'cf-warp-tag-id': z.string().uuid().optional(),
//   'user-agent': z.string().min(1).optional(),
// });

// function collectRequestInfo(request: Request) {
// 	const rawHeaders = Object.fromEntries(
// 		[...request.headers.entries()].map(([k, v]) => [k.toLowerCase(), v])
// 	);
// 	const connection_info = cfHeadersSchema.parse(rawHeaders)
// 	// console.log(connection_info)

// } 