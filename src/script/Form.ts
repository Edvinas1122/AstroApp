import { useState, type FormEvent } from "preact/compat";

type FormAction = ((e: FormEvent) => void) & {
	stroke: (e: KeyboardEvent) => void;
	loading: boolean;
};

function createFormAction<Keys extends string>(
	values: readonly Keys[], handler: (values: { [K in Keys]: string }, reset: () => void) => void)
{
	const [loading, setLoading] = useState(false);

	function handle(data: FormData, reset: () => void) {
		const object = new Map<string, string>();
		function setValue(value: string) {
			const item = data.get(value)?.toString()
			if (!item) throw new Error(`not found ${value} in form`);
			object.set(value, item);
		}
		values.forEach(setValue);
		handler(Object.fromEntries(object) as { [K in Keys]: string },
			() => {setLoading(false), reset()});
	}

	const submit: FormAction = (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		const form = e.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		handle(data, () => form.reset());
		// form.reset()
	}

	submit.stroke = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey && e.currentTarget) {
			e.preventDefault();
			const text_area = e.currentTarget as HTMLTextAreaElement
			const form = text_area.form as HTMLFormElement;
			const data = new FormData(form);
			handle(data, () => form.reset());
			// form.reset();
		}
	};

	submit.loading = loading;

	return submit;
}

function createButtonEvent(handler: (e: Event, reset: () => void) => void) {
	const [loading, setLoading] = useState(false);

	const action = (e: Event) => {
		setLoading(true);
		handler(e, () => setLoading(false))
	}

	action.loading = loading;

	return action;
}

export {createFormAction, createButtonEvent};