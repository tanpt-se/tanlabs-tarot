export type ReadingStatus = "pending" | "drawing" | "interpreting" | "complete";

export type CardArcana = "major" | "minor";

export interface DrawnCard {
	id: string;
	arcana: CardArcana;
	reversed: boolean;
}

export interface Reading {
	id: string;
	question: string;
	createdAt: string;
	status: ReadingStatus;
	cards: DrawnCard[];
	interpretation: string | null;
}

export interface ReadingHistory {
	readings: Reading[];
}
