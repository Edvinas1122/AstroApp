import { useState, type FormEvent } from "preact/compat";

type FormAction = ((e: FormEvent) => void) & {
	form: (form: HTMLFormElement) => void;
	loading: boolean;
};

type FieldDef = string | { name: string; type: 'text' | 'file' };

type InferValues<F extends readonly FieldDef[]> = {
  [K in F[number] as K extends string ? K : K extends { name: infer N } ? N : never]: K extends string
    ? string
    : K extends { type: 'file' }
    ? File
    : string;
};

function createFormAction<F extends readonly FieldDef[]>(
	fields: readonly [...F],
	handler: (values: InferValues<F>, reset: () => void) => void
): FormAction {
	const [loading, setLoading] = useState(false);


	function handle(data: FormData, reset: () => void) {
		const record: Record<string, string | File> = {};

		fields.forEach((fieldRaw) => {
	
			const field = typeof fieldRaw === 'string' ?  fieldRaw : fieldRaw.name;

			const value = data.get(field);
			if (!value) throw new Error(`Field '${field}' not found in form`);
			switch (typeof value) {
				case 'string':
					record[field] = value;
					break;
				case 'object':
					if (value instanceof File) {
						record[field] = value;
					}
					break;
				default:
					throw new Error(`Unsupported value type for field '${field}'`);
			}
		});

		handler(record as InferValues<F>, () => {
			setLoading(false);
			reset();
		});
	}
	

	const submit: FormAction = (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		const form = e.currentTarget as HTMLFormElement;
		submit.form(form);
	}

	submit.form = (form: HTMLFormElement) => {
		const data = new FormData(form);
		handle(data, () => form.reset());
	}

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