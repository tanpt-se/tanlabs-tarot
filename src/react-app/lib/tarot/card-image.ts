import { cardIdToPublicUrl } from "./card-path";
import type { CardId } from "./deck-ids";

export type CardImage = string;

const cache = new Map<CardId, string>();
const pending = new Map<CardId, Promise<string>>();

const DEFAULT_PRELOAD_CONCURRENCY = 6;

export function isCardImageReady(id: CardId): boolean {
	return cache.has(id);
}

function decodeImage(url: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.decoding = "async";
		image.onload = () => resolve();
		image.onerror = () => reject(new Error(`Failed to load card image: ${url}`));
		image.src = url;
	});
}

async function loadCardImageUncached(id: CardId): Promise<string> {
	const url = cardIdToPublicUrl(id);
	await decodeImage(url);
	cache.set(id, url);
	return url;
}

async function runPool<T>(
	items: T[],
	limit: number,
	work: (item: T) => Promise<unknown>,
): Promise<void> {
	const queue = [...items];
	const workerCount = Math.min(limit, queue.length);
	if (workerCount === 0) return;

	await Promise.all(
		Array.from({ length: workerCount }, async () => {
			while (queue.length > 0) {
				const item = queue.shift();
				if (item === undefined) return;
				await work(item);
			}
		}),
	);
}

export function getCardImage(id: CardId): string | undefined {
	return cache.get(id);
}

export function getCardImageUrl(id: CardId): string {
	return cache.get(id) ?? cardIdToPublicUrl(id);
}

export function loadCardImage(id: CardId): Promise<string> {
	const cached = cache.get(id);
	if (cached) {
		return Promise.resolve(cached);
	}

	const inflight = pending.get(id);
	if (inflight) {
		return inflight;
	}

	const promise = loadCardImageUncached(id).finally(() => {
		pending.delete(id);
	});
	pending.set(id, promise);
	return promise;
}

/** Warm cache for the next card drawn from the top of the deck. */
export function preloadTopOfDeck(deck: CardId[]): void {
	if (deck.length === 0) return;
	void loadCardImage(deck[deck.length - 1]);
}

export async function preloadCardImages(
	ids: CardId[],
	concurrency = DEFAULT_PRELOAD_CONCURRENCY,
): Promise<void> {
	const unique = [...new Set(ids)];
	await runPool(unique, concurrency, (id) => loadCardImage(id));
}
