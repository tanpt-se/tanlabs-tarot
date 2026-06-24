import type {
	SelfViewSession,
	SelfViewSessionHistory,
} from "../types/self-view-session";
import type { DrawnCard } from "../types/reading";

const STORAGE_KEY = "tanlabs-tarot:self-view-sessions";

const emptyHistory = (): SelfViewSessionHistory => ({ sessions: [] });

export function loadSelfViewHistory(): SelfViewSessionHistory {
	if (typeof localStorage === "undefined") return emptyHistory();

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return emptyHistory();

		const parsed = JSON.parse(raw) as SelfViewSessionHistory;
		if (!Array.isArray(parsed.sessions)) return emptyHistory();

		return { sessions: parsed.sessions };
	} catch {
		return emptyHistory();
	}
}

export function saveSelfViewHistory(history: SelfViewSessionHistory): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function createSelfViewSession(cards: DrawnCard[]): SelfViewSession {
	return {
		id: crypto.randomUUID(),
		createdAt: new Date().toISOString(),
		cards,
	};
}
