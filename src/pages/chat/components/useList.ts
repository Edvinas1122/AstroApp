// import { useState } from 'preact/hooks';

// // Accept keys that are string OR number (exclude symbol for simplicity)
// type WithId<Key extends string | number> = Record<Key, string | number>;

// function useListState<
// 	T extends WithId<K>,
// 	K extends keyof T & (string | number)
// >(initial: T[], idKey: K) {
// 	const [list, setList] = useState<T[]>(initial);

// 	function add(item: T) {
// 		setList(prev => [...prev, item]);
// 	}

// 	function remove(id: T[K]) {
// 		setList(prev => prev.filter(item => item[idKey] !== id));
// 	}

// 	function update(id: T[K], partial: Partial<T>) {
// 		setList(prev =>
// 			prev.map(item =>
// 				item[idKey] === id ? { ...item, ...partial } : item
// 			)
// 		);
// 	}

// 	function clear() {
// 		setList([]);
// 	}

// 	function find(id: T[K]) {
// 		return list.find(item => item[idKey] === id);
// 	}

// 	function move(fromIndex: number, toIndex: number) {
// 		setList(prev => {
// 			const copy = [...prev];
// 			const [moved] = copy.splice(fromIndex, 1);
// 			copy.splice(toIndex, 0, moved);
// 			return copy;
// 		});
// 	}

// 	return {
// 		list,
// 		add,
// 		remove,
// 		update,
// 		clear,
// 		find,
// 		move,
// 		setList,
// 	};
// }

// export {useListState};
