import { cardIdToGlobKey } from "./card-path";
import type { CardId } from "./deck-ids";

export type CardImage = string;

const loaders = import.meta.glob<{ default: string }>(
	"../../assets/cards/**/*.webp",
);

const cache = new Map<CardId, string>();
const pending = new Map<CardId, Promise<string>>();

async function loadCardImageUncached(id: CardId): Promise<string> {
	const key = cardIdToGlobKey(id);
	const loader = loaders[key];
	if (!loader) {
		throw new Error(`Missing card image module: ${key}`);
	}

	const module = await loader();
	const url = module.default;
	cache.set(id, url);
	return url;
}

export function getCardImage(id: CardId): string | undefined {
	return cache.get(id);
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

export async function preloadCardImages(ids: CardId[]): Promise<void> {
	const unique = [...new Set(ids)];
	await Promise.all(unique.map((id) => loadCardImage(id)));
}
