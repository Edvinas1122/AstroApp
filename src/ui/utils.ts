import type { FormEvent } from "preact/compat";

function createFormAction<Keys extends string>(
	values: readonly Keys[], handler: (values: { [K in Keys]: string }) => void)
{
	return (e: FormEvent) => {
		e.preventDefault();
		const data = new FormData(e.currentTarget as HTMLFormElement);
		const object = new Map<string, string>();
		function setValue(value: string) {
			const item = data.get(value)?.toString()
			if (!item) throw new Error(`not found ${value} in form`);
			object.set(value, item);
		}
		values.forEach(setValue);
		handler(Object.fromEntries(object) as { [K in Keys]: string });
	}
}

export {createFormAction};