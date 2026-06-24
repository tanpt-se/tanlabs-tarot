import type { DrawnCard } from "./reading";

export interface SelfViewSession {
	id: string;
	createdAt: string;
	cards: DrawnCard[];
}

export interface SelfViewSessionHistory {
	sessions: SelfViewSession[];
}
