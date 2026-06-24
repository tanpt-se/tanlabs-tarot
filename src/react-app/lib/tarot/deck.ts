import { MAJOR, MINOR } from "../../assets/cards";

export const MAJOR_CARD_IDS = Object.keys(MAJOR) as (keyof typeof MAJOR)[];
export const MINOR_CARD_IDS = Object.keys(MINOR) as (keyof typeof MINOR)[];
export const ALL_CARD_IDS = [...MAJOR_CARD_IDS, ...MINOR_CARD_IDS] as const;

export type CardId = (typeof ALL_CARD_IDS)[number];

export function isMajorCard(id: string): id is keyof typeof MAJOR {
	return id in MAJOR;
}
