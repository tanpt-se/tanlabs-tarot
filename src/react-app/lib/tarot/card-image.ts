import { MAJOR, MINOR, type CardImage } from "../../assets/cards";
import { isMajorCard, type CardId } from "./deck";

export function getCardImage(id: CardId): CardImage {
	if (isMajorCard(id)) return MAJOR[id];
	return MINOR[id as keyof typeof MINOR];
}
