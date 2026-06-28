import type { Reading, ReadingHistory } from "../types/reading";

const STORAGE_KEY = "tanlabs-tarot:readings";

const emptyHistory = (): ReadingHistory => ({ readings: [] });

export function loadReadingHistory(): ReadingHistory {
	if (typeof localStorage === "undefined") return emptyHistory();

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return emptyHistory();

		const parsed = JSON.parse(raw) as ReadingHistory;
		if (!Array.isArray(parsed.readings)) return emptyHistory();

		return {
			readings: parsed.readings.map((reading) => ({
				...reading,
				spreadType: reading.spreadType ?? null,
			})),
		};
	} catch {
		return emptyHistory();
	}
}

export function saveReadingHistory(history: ReadingHistory): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function createReading(question: string): Reading {
	return {
		id: crypto.randomUUID(),
		question: question.trim(),
		createdAt: new Date().toISOString(),
		status: "pending",
		spreadType: null,
		cards: [],
		interpretation: null,
	};
}
