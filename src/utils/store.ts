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
	protected set(id: string, item: T): T {
		this.store.setKey(id, [
			...this.get(id),
			item
		]);
		return item;
	}

	// Set multiple items
	protected setMany(id: string, items: T[]): void {
		this.store.setKey(id, [
			...this.get(id),
			...items
		]);
	}

	protected update(id: string, predicate: (item: T) => boolean, update: (item: T) => T): void {
		const currentItems = this.get(id);
		const updatedItems = currentItems.map(item => 
			predicate(item) ? update(item) : item
		);
		this.store.setKey(id, updatedItems);
	}

	protected erase(id: string, predicate: (item: T) => boolean) {
		const filtered = this.get(id).filter(predicate);
		this.store.setKey(id, filtered);
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
}

export {PageStore};