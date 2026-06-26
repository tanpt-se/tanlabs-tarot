import type { CardId } from "./deck-ids";
import { isMajorCard } from "./deck-ids";

const MINOR_PATTERN =
	/^(ACE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|PAGE|KNIGHT|QUEEN|KING)_OF_(WANDS|CUPS|SWORDS|PENTACLES)$/;

/** Public URL path segment under /cards/ */
export function cardIdToAssetRelativePath(id: CardId): string {
	if (isMajorCard(id)) {
		if (id.startsWith("THE_")) {
			return `major/the-${id.slice(4).toLowerCase().replace(/_/g, "-")}.webp`;
		}
		return `major/${id.toLowerCase().replace(/_/g, "-")}.webp`;
	}

	const match = id.match(MINOR_PATTERN);
	if (!match) {
		throw new Error(`Unknown card id: ${id}`);
	}

	const [, rank, suit] = match;
	return `minor/${suit.toLowerCase()}/${rank.toLowerCase()}.webp`;
}

const cardsBaseUrl = `${import.meta.env.BASE_URL}cards/`;

export function cardIdToPublicUrl(id: CardId): string {
	return `${cardsBaseUrl}${cardIdToAssetRelativePath(id)}`;
}
