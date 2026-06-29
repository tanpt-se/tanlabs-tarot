import type { Locale } from "../../i18n";
import type { CardId } from "./deck";

const CARD_NAMES_EN: Record<CardId, string> = {
	THE_FOOL: "The Fool",
	THE_MAGICIAN: "The Magician",
	THE_HIGH_PRIESTESS: "The High Priestess",
	THE_EMPRESS: "The Empress",
	THE_EMPEROR: "The Emperor",
	THE_HIEROPHANT: "The Hierophant",
	THE_LOVERS: "The Lovers",
	THE_CHARIOT: "The Chariot",
	STRENGTH: "Strength",
	THE_HERMIT: "The Hermit",
	WHEEL_OF_FORTUNE: "Wheel of Fortune",
	JUSTICE: "Justice",
	THE_HANGED_MAN: "The Hanged Man",
	DEATH: "Death",
	TEMPERANCE: "Temperance",
	THE_DEVIL: "The Devil",
	THE_TOWER: "The Tower",
	THE_STAR: "The Star",
	THE_MOON: "The Moon",
	THE_SUN: "The Sun",
	JUDGEMENT: "Judgement",
	THE_WORLD: "The World",
	ACE_OF_WANDS: "Ace of Wands",
	TWO_OF_WANDS: "Two of Wands",
	THREE_OF_WANDS: "Three of Wands",
	FOUR_OF_WANDS: "Four of Wands",
	FIVE_OF_WANDS: "Five of Wands",
	SIX_OF_WANDS: "Six of Wands",
	SEVEN_OF_WANDS: "Seven of Wands",
	EIGHT_OF_WANDS: "Eight of Wands",
	NINE_OF_WANDS: "Nine of Wands",
	TEN_OF_WANDS: "Ten of Wands",
	PAGE_OF_WANDS: "Page of Wands",
	KNIGHT_OF_WANDS: "Knight of Wands",
	QUEEN_OF_WANDS: "Queen of Wands",
	KING_OF_WANDS: "King of Wands",
	ACE_OF_CUPS: "Ace of Cups",
	TWO_OF_CUPS: "Two of Cups",
	THREE_OF_CUPS: "Three of Cups",
	FOUR_OF_CUPS: "Four of Cups",
	FIVE_OF_CUPS: "Five of Cups",
	SIX_OF_CUPS: "Six of Cups",
	SEVEN_OF_CUPS: "Seven of Cups",
	EIGHT_OF_CUPS: "Eight of Cups",
	NINE_OF_CUPS: "Nine of Cups",
	TEN_OF_CUPS: "Ten of Cups",
	PAGE_OF_CUPS: "Page of Cups",
	KNIGHT_OF_CUPS: "Knight of Cups",
	QUEEN_OF_CUPS: "Queen of Cups",
	KING_OF_CUPS: "King of Cups",
	ACE_OF_SWORDS: "Ace of Swords",
	TWO_OF_SWORDS: "Two of Swords",
	THREE_OF_SWORDS: "Three of Swords",
	FOUR_OF_SWORDS: "Four of Swords",
	FIVE_OF_SWORDS: "Five of Swords",
	SIX_OF_SWORDS: "Six of Swords",
	SEVEN_OF_SWORDS: "Seven of Swords",
	EIGHT_OF_SWORDS: "Eight of Swords",
	NINE_OF_SWORDS: "Nine of Swords",
	TEN_OF_SWORDS: "Ten of Swords",
	PAGE_OF_SWORDS: "Page of Swords",
	KNIGHT_OF_SWORDS: "Knight of Swords",
	QUEEN_OF_SWORDS: "Queen of Swords",
	KING_OF_SWORDS: "King of Swords",
	ACE_OF_PENTACLES: "Ace of Pentacles",
	TWO_OF_PENTACLES: "Two of Pentacles",
	THREE_OF_PENTACLES: "Three of Pentacles",
	FOUR_OF_PENTACLES: "Four of Pentacles",
	FIVE_OF_PENTACLES: "Five of Pentacles",
	SIX_OF_PENTACLES: "Six of Pentacles",
	SEVEN_OF_PENTACLES: "Seven of Pentacles",
	EIGHT_OF_PENTACLES: "Eight of Pentacles",
	NINE_OF_PENTACLES: "Nine of Pentacles",
	TEN_OF_PENTACLES: "Ten of Pentacles",
	PAGE_OF_PENTACLES: "Page of Pentacles",
	KNIGHT_OF_PENTACLES: "Knight of Pentacles",
	QUEEN_OF_PENTACLES: "Queen of Pentacles",
	KING_OF_PENTACLES: "King of Pentacles",
};

const CARD_NAMES_VI: Record<CardId, string> = {
	THE_FOOL: "Kẻ Khờ",
	THE_MAGICIAN: "Ảo Thuật Gia",
	THE_HIGH_PRIESTESS: "Nữ Tư Tế",
	THE_EMPRESS: "Nữ Hoàng",
	THE_EMPEROR: "Hoàng Đế",
	THE_HIEROPHANT: "Giáo Hoàng",
	THE_LOVERS: "Tình Nhân",
	THE_CHARIOT: "Cỗ Xe",
	STRENGTH: "Sức Mạnh",
	THE_HERMIT: "Ẩn Sĩ",
	WHEEL_OF_FORTUNE: "Bánh Xe Vận Mệnh",
	JUSTICE: "Công Lý",
	THE_HANGED_MAN: "Người Treo Ngược",
	DEATH: "Cái Chết",
	TEMPERANCE: "Kiềm Chế",
	THE_DEVIL: "Ác Quỷ",
	THE_TOWER: "Tháp",
	THE_STAR: "Ngôi Sao",
	THE_MOON: "Mặt Trăng",
	THE_SUN: "Mặt Trời",
	JUDGEMENT: "Phán Xét",
	THE_WORLD: "Thế Giới",
	ACE_OF_WANDS: "Át Gậy",
	TWO_OF_WANDS: "Hai Gậy",
	THREE_OF_WANDS: "Ba Gậy",
	FOUR_OF_WANDS: "Bốn Gậy",
	FIVE_OF_WANDS: "Năm Gậy",
	SIX_OF_WANDS: "Sáu Gậy",
	SEVEN_OF_WANDS: "Bảy Gậy",
	EIGHT_OF_WANDS: "Tám Gậy",
	NINE_OF_WANDS: "Chín Gậy",
	TEN_OF_WANDS: "Mười Gậy",
	PAGE_OF_WANDS: "Tiểu Đồng Gậy",
	KNIGHT_OF_WANDS: "Kỵ Sĩ Gậy",
	QUEEN_OF_WANDS: "Nữ Hoàng Gậy",
	KING_OF_WANDS: "Vua Gậy",
	ACE_OF_CUPS: "Át Cốc",
	TWO_OF_CUPS: "Hai Cốc",
	THREE_OF_CUPS: "Ba Cốc",
	FOUR_OF_CUPS: "Bốn Cốc",
	FIVE_OF_CUPS: "Năm Cốc",
	SIX_OF_CUPS: "Sáu Cốc",
	SEVEN_OF_CUPS: "Bảy Cốc",
	EIGHT_OF_CUPS: "Tám Cốc",
	NINE_OF_CUPS: "Chín Cốc",
	TEN_OF_CUPS: "Mười Cốc",
	PAGE_OF_CUPS: "Tiểu Đồng Cốc",
	KNIGHT_OF_CUPS: "Kỵ Sĩ Cốc",
	QUEEN_OF_CUPS: "Nữ Hoàng Cốc",
	KING_OF_CUPS: "Vua Cốc",
	ACE_OF_SWORDS: "Át Kiếm",
	TWO_OF_SWORDS: "Hai Kiếm",
	THREE_OF_SWORDS: "Ba Kiếm",
	FOUR_OF_SWORDS: "Bốn Kiếm",
	FIVE_OF_SWORDS: "Năm Kiếm",
	SIX_OF_SWORDS: "Sáu Kiếm",
	SEVEN_OF_SWORDS: "Bảy Kiếm",
	EIGHT_OF_SWORDS: "Tám Kiếm",
	NINE_OF_SWORDS: "Chín Kiếm",
	TEN_OF_SWORDS: "Mười Kiếm",
	PAGE_OF_SWORDS: "Tiểu Đồng Kiếm",
	KNIGHT_OF_SWORDS: "Kỵ Sĩ Kiếm",
	QUEEN_OF_SWORDS: "Nữ Hoàng Kiếm",
	KING_OF_SWORDS: "Vua Kiếm",
	ACE_OF_PENTACLES: "Át Tiền",
	TWO_OF_PENTACLES: "Hai Tiền",
	THREE_OF_PENTACLES: "Ba Tiền",
	FOUR_OF_PENTACLES: "Bốn Tiền",
	FIVE_OF_PENTACLES: "Năm Tiền",
	SIX_OF_PENTACLES: "Sáu Tiền",
	SEVEN_OF_PENTACLES: "Bảy Tiền",
	EIGHT_OF_PENTACLES: "Tám Tiền",
	NINE_OF_PENTACLES: "Chín Tiền",
	TEN_OF_PENTACLES: "Mười Tiền",
	PAGE_OF_PENTACLES: "Tiểu Đồng Tiền",
	KNIGHT_OF_PENTACLES: "Kỵ Sĩ Tiền",
	QUEEN_OF_PENTACLES: "Nữ Hoàng Tiền",
	KING_OF_PENTACLES: "Vua Tiền",
};

const CARD_MEANINGS_EN: Partial<Record<CardId, string>> = {
	THE_FOOL: "New beginnings, spontaneity, and trust in the journey.",
	THE_LOVERS: "Love, choices, and meaningful connection.",
	THE_TOWER: "Sudden change and the breaking of old structures.",
	THE_STAR: "Hope, healing, and renewed faith.",
	THE_MOON: "Intuition, uncertainty, and the subconscious.",
	THE_SUN: "Joy, clarity, and success.",
	ACE_OF_CUPS: "New emotional beginnings and open-heartedness.",
	EIGHT_OF_PENTACLES: "Dedication, craft, and steady improvement.",
};

const CARD_MEANINGS_VI: Partial<Record<CardId, string>> = {
	THE_FOOL: "Khởi đầu mới, sự tự phát và tin tưởng vào hành trình.",
	THE_LOVERS: "Tình yêu, lựa chọn và sự gắn kết ý nghĩa.",
	THE_TOWER: "Thay đổi đột ngột và sự sụp đổ của cấu trúc cũ.",
	THE_STAR: "Hy vọng, chữa lành và niềm tin mới.",
	THE_MOON: "Trực giác, mơ hồ và tiềm thức.",
	THE_SUN: "Niềm vui, sự rõ ràng và thành công.",
	ACE_OF_CUPS: "Khởi đầu cảm xúc mới và trái tim rộng mở.",
	EIGHT_OF_PENTACLES: "Sự chăm chỉ, kỹ năng và tiến bộ bền bỉ.",
};

const FALLBACK_EN =
	"This card invites reflection on the themes it traditionally represents.";
const FALLBACK_VI =
	"Lá bài này mời bạn suy ngẫm về những chủ đề mà nó thường tượng trưng.";

export function getCardName(id: string, locale: Locale): string {
	const cardId = id as CardId;
	const names = locale === "vi" ? CARD_NAMES_VI : CARD_NAMES_EN;
	return names[cardId] ?? id;
}

export function getCardMeaning(
	id: string,
	reversed: boolean,
	locale: Locale,
): string {
	const cardId = id as CardId;
	const meanings = locale === "vi" ? CARD_MEANINGS_VI : CARD_MEANINGS_EN;
	const base = meanings[cardId] ?? (locale === "vi" ? FALLBACK_VI : FALLBACK_EN);
	if (!reversed) return base;
	return locale === "vi"
		? `${base} Ở chiều ngược, năng lượng này bị cản trở hoặc cần được nhìn nhận từ góc độ khác.`
		: `${base} Reversed, this energy may be blocked or needs a different perspective.`;
}

export function buildCardInterpretation(
	card: { id: string; reversed: boolean },
	locale: Locale,
): string {
	return getCardMeaning(card.id, card.reversed, locale);
}

export function buildInterpretation(
	question: string,
	cards: { id: string; reversed: boolean }[],
	positionLabels: string[],
	locale: Locale,
): string {
	const lines = cards.map((card, index) => {
		const position = positionLabels[index] ?? "";
		const name = getCardName(card.id, locale);
		const orientation =
			locale === "vi"
				? card.reversed
					? " (ngược)"
					: " (thuận)"
				: card.reversed
					? " (reversed)"
					: " (upright)";
		const meaning = getCardMeaning(card.id, card.reversed, locale);
		const prefix = position ? `${position}: ` : "";
		return `${prefix}【${name}】${orientation}\n${meaning}`;
	});

	const intro = !question.trim()
		? locale === "vi"
			? "Lá daily của bạn gợi ý:\n\n"
			: "Your daily card suggests:\n\n"
		: locale === "vi"
			? `Với câu hỏi "${question}", các lá bài gợi ý:\n\n`
			: `For your question "${question}", the cards suggest:\n\n`;

	return intro + lines.join("\n\n");
}
