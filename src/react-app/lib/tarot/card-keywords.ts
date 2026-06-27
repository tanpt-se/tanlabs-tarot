import type { Locale } from "../../i18n";
import { getCardMeaning } from "./card-text";

export function getCardKeywords(
	id: string,
	reversed: boolean,
	locale: Locale,
): string[] {
	const meaning = getCardMeaning(id, reversed, locale);
	const parts = meaning
		.replace(/\.$/, "")
		.split(/[,;]/)
		.map((part) => part.trim())
		.filter(Boolean);

	if (parts.length >= 2) return parts.slice(0, 3);

	const words = meaning.split(/\s+/).filter((word) => word.length > 3);
	return words.slice(0, 3);
}
