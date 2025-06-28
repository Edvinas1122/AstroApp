import { map, type MapStore } from 'nanostores';

class Pages {
	private fetched = new Map<string, {page: number}>()

	public with(key: string, handler: () => Promise<void>) {
		if (!this.fetched.has(key)) {
			handler().then(() => {
				this.fetched.set(key, {page: 0});
			})
		}
	}
}

class PageStoreMap<T> {
	private store: MapStore<Record<string, T[]>>;
	protected pages = new Pages();

	constructor(
		initialData: Record<string, T[]> = {}
	) {
		this.store = map(initialData);
	}

	// Get the underlying nanostore
	get $store(): MapStore<Record<string, T[]>> {
		return this.store;
	}

	// Get items by ID
	get(id: string): T[] {
		return this.store.get()[id] || [];
	}

	// Set single item
	protected set(id: string, item: T): void {
		this.store.setKey(id, [
			...this.get(id),
			item
		]);
	}

	// Set multiple items
	protected setMany(id: string, items: T[]): void {
		this.store.setKey(id, [
			...this.get(id),
			...items
		]);
	}
}

class PageStore<T> extends PageStoreMap<T> {

	constructor(
		initialData: Record<string, T[]> = {},
		private fetcher: (params: { id: string; page: number; }) => Promise<T[]>,
		// private key: (data: T) => string,
		// private updateMethod: <ARGS>(input: ARGS) => Promise<T>,
	) {
		super(initialData)
	}

	fetch(id: string) {
		return this.pages.with(id, async () => {
			const data = await this.fetcher({ id, page: 0 });
			this.setMany(id, data);
		});
	}

	// send(input: ARGS) {
	// 	this.updateMethod(input).then(this.setResult);
	// }

	// receive = (data: T) => this.setResult(data); 

	// private setResult = (data: T) => this.set(this.key(data), data);
}

export {PageStore};