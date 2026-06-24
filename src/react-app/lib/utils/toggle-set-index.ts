export function toggleSetIndex(indices: Set<number>, index: number): Set<number> {
	const next = new Set(indices);
	if (next.has(index)) {
		next.delete(index);
	} else {
		next.add(index);
	}
	return next;
}
