import type { FormEvent } from "preact/compat";

type FormAction = ((e: FormEvent) => void) & {
	stroke: (e: KeyboardEvent) => void;
};

function createFormAction<Keys extends string>(
	values: readonly Keys[], handler: (values: { [K in Keys]: string }) => void)
{

	function handle(data: FormData) {
		const object = new Map<string, string>();
		function setValue(value: string) {
			const item = data.get(value)?.toString()
			if (!item) throw new Error(`not found ${value} in form`);
			object.set(value, item);
		}
		values.forEach(setValue);
		handler(Object.fromEntries(object) as { [K in Keys]: string });
	}

	const submit: FormAction = (e: FormEvent) => {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		handle(data);
		form.reset()
	}

	submit.stroke = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey && e.currentTarget) {
			e.preventDefault();
			const text_area = e.currentTarget as HTMLTextAreaElement
			const form = text_area.form as HTMLFormElement;
			const data = new FormData(form);
			handle(data);
			form.reset();
		}
	};

	return submit;
}

export {createFormAction};