import type { DrawnCard } from "../types/reading";

const STORAGE_KEY = "tanlabs-tarot:daily-card";

type StoredDailyCard = {
	date: string;
	card: DrawnCard;
};

function getLocalDateKey(date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function getTodayDailyCard(): DrawnCard | null {
	if (typeof localStorage === "undefined") return null;

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;

		const parsed = JSON.parse(raw) as StoredDailyCard;
		if (parsed.date !== getLocalDateKey() || !parsed.card?.id) {
			return null;
		}

		return parsed.card;
	} catch {
		return null;
	}
}

export function saveTodayDailyCard(card: DrawnCard): void {
	if (typeof localStorage === "undefined") return;

	try {
		const payload: StoredDailyCard = {
			date: getLocalDateKey(),
			card,
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
	} catch {
		// Quota or private mode — daily card still works for this session.
	}
}

export function hasTodayDailyCard(): boolean {
	return getTodayDailyCard() !== null;
}
