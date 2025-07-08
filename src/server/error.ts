import type { APIContext, APIRoute } from "astro";

class CustomError extends Error {
	code: number;
	constructor(message: string, code: number) {
		super(message);
		this.code = code;
		Object.setPrototypeOf(this, CustomError.prototype); // for instanceof to work properly
	}
}

export function withError(
	method: (context: APIContext, utils: {validate: typeof validate}) => Promise<Response>
): APIRoute {

	function validate<T extends object>(item: T) {
		if ("message" in item && "code" in item) {
			const err = item as unknown as { message: string; code: number };
			throw new CustomError(err.message, err.code);
		}
		return item as Exclude<T, {message: string, code: number}>;
	}

	return async (context) => {
		try {
			return await method(context, {validate});
		} catch (error: any) {
			if (error instanceof CustomError) {
			return new Response(error.message, { status: error.code });
			}
			return new Response(error.message || "Unknown error", { status: 400 });
		}
	};
}