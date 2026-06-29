import { drawCards } from "../tarot/draw";
import { getTodayDailyCard, saveTodayDailyCard } from "../storage/daily-card-store";
import type { DrawnCard } from "../types/reading";

/** Returns today's persisted daily card, or draws and saves a new one. */
export function resolveTodayDailyCard(): DrawnCard {
	const existing = getTodayDailyCard();
	if (existing) return existing;

	const card = drawCards(1)[0];
	saveTodayDailyCard(card);
	return card;
}
