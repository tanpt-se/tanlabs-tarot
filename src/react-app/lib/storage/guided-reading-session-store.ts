import type { Reading } from "../types/reading";

const STORAGE_KEY = "tanlabs-tarot:guided-session";

export type GuidedReadingSession = {
	readingId: string;
};

export function loadGuidedReadingSession(): GuidedReadingSession | null {
	if (typeof sessionStorage === "undefined") return null;

	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;

		const parsed = JSON.parse(raw) as GuidedReadingSession;
		if (typeof parsed.readingId !== "string" || !parsed.readingId.trim()) {
			return null;
		}

		return { readingId: parsed.readingId };
	} catch {
		return null;
	}
}

export function saveGuidedReadingSession(readingId: string): void {
	if (typeof sessionStorage === "undefined") return;

	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ readingId }));
	} catch {
		// Quota or private mode — reading data still lives in localStorage.
	}
}

export function clearGuidedReadingSession(): void {
	if (typeof sessionStorage === "undefined") return;

	try {
		sessionStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
}

export function resolveGuidedReadingRestore(
	readings: Reading[],
): GuidedReadingSession | null {
	const stored = loadGuidedReadingSession();
	if (!stored) return null;

	const reading = readings.find(
		(item) => item.id === stored.readingId && item.status !== "complete",
	);
	if (reading) return stored;

	clearGuidedReadingSession();
	return null;
}
