import type { APIRoute } from "astro";
import { withError } from "../../utils/error";
import type { SocketUtilsService } from "../../../../api/src";


export const prerender = false;

export const GET: APIRoute = withError(async (context, {validate}) => {
	const sc_utils = context.locals.runtime.env.WebSocket as unknown as SocketUtilsService;
	const email = context.locals.user.email;
	const pair = await sc_utils.key(email);
	return new Response(JSON.stringify({key: pair}), {
		headers: {
			"Content-Type": "application/json"
		}
	});
});