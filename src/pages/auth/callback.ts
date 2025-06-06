import type { APIRoute } from "astro";
import type { AuthService, UserService } from "../../../../api/src";
import { withError } from "../../utils/error";

export const prerender = false;

const params = {
	auth_cookie_name: "token",
	token_age: 60 * 60 * 24 * 14, // Two weeks in seconds
	domain: '.edvinas.online'
}

const cookie = (token: string) => [
  `${params.auth_cookie_name}=${token}`,
  'HttpOnly',
  'Secure',
  'SameSite=None',
  'Path=/',
  `Max-Age=${params.token_age}`,
  `Domain=${params.domain}`
];

export const GET: APIRoute = withError(
	async (context, {validate}) => {
		
		const Auth = context.locals.runtime.env.Auth as unknown as AuthService
		const User = context.locals.runtime.env.User as unknown as UserService
		
		const user = validate(await Auth.google(context.request.url));
		const token = validate(await User.sign(user)).token;

		const redirect_path = '/';
		const respond = new Response("", {status: 302});
		respond.headers.append('Set-Cookie', cookie(token).join(";"));
		respond.headers.append('Location', `${redirect_path}?authStatus=completed`);

		return respond;
	})
