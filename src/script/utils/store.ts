import { map, type MapStore } from 'nanostores';

// Define a type for an array with a loading property
type ArrayWithLoading<T> = T[] & { loading: boolean };

class Pages { // non reactive conditional storage
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
    private store: MapStore<Record<string, ArrayWithLoading<T>>>; 
    protected pages = new Pages();

    constructor(
        initialData: Record<string, T[]> = {}
    ) {
        // Transform initialData to include loading: false
        const transformedData: Record<string, ArrayWithLoading<T>> = {};
        for (const [id, items] of Object.entries(initialData)) {
            const arrayWithLoading = Object.assign([...items], { loading: false });
            transformedData[id] = arrayWithLoading as ArrayWithLoading<T>;
        }
        this.store = map(transformedData);
    }

    // Get the underlying nanostore
    get $store(): MapStore<Record<string, ArrayWithLoading<T>>> {
        return this.store;
    }

    // Get items by ID, maintaining the original interface
    get(id: string): T[] {
        return this.store.get()[id] || [];
    }

    // Check loading state for an ID
    isLoading(id: string): boolean {
        return this.store.get()[id]?.loading ?? false;
    }

    find(id: string, predicate: (item: T) => boolean) {
        return this.get(id).find(predicate);
    }

    // Set single item
    protected set(id: string, item: T): T {
        const current = this.store.get()[id] || Object.assign([], { loading: false });
        const newItems = [...current, item];
        this.store.setKey(id, Object.assign(newItems, { loading: current.loading }) as ArrayWithLoading<T>);
        return item;
    }

    // Set multiple items
    protected setMany(id: string, items: T[]): void {
        const current = this.store.get()[id] || Object.assign([], { loading: false });
        const newItems = [...current, ...items];
        this.store.setKey(id, Object.assign(newItems, { loading: current.loading }) as ArrayWithLoading<T>);
    }

    protected update(id: string, predicate: (item: T) => boolean, update: (item: T) => T): void {
        const current = this.store.get()[id] || Object.assign([], { loading: false });
        const updatedItems = current.map(item =>
            predicate(item) ? update(item) : item
        );
        this.store.setKey(id, Object.assign(updatedItems, { loading: current.loading }) as ArrayWithLoading<T>);
    }

    protected erase(id: string, predicate: (item: T) => boolean) {
        const current = this.store.get()[id] || Object.assign([], { loading: false });
        const filtered = current.filter(predicate);
        this.store.setKey(id, Object.assign(filtered, { loading: current.loading }) as ArrayWithLoading<T>);
    }
}

class PageStore<T> extends PageStoreMap<T> {
    constructor(
        initialData: Record<string, T[]> = {},
        private fetcher: (params: { id: string; page: number; }) => Promise<T[]>,
    ) {
        super(initialData);
    }

    async fetch(id: string) {
        return this.pages.with(id, async () => {
            // Set loading state to true
            const current = this.$store.get()[id] || Object.assign([], { loading: false });
            this.$store.setKey(id, Object.assign([...current], { loading: true }) as ArrayWithLoading<T>);
            try {
                const data = await this.fetcher({ id, page: 0 });
                this.setMany(id, data);
            } finally {
                // Set loading state to false
                const updatedCurrent = this.$store.get()[id] || Object.assign([], { loading: false });
                this.$store.setKey(id, Object.assign([...updatedCurrent], { loading: false }) as ArrayWithLoading<T>);
            }
        });
    }
}

export { PageStore };