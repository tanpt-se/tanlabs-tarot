import { useCallback, useState } from "react";
import type { DrawnCard } from "../../lib/types/reading";
import { getCardImage } from "../../lib/tarot/card-image";
import type { CardId } from "../../lib/tarot/deck";
import { useLocale } from "../../hooks/use-locale";
import { CardBack } from "../brand/CardBack";
import { CardArtMark } from "../brand/CardArtMark";

interface TarotCardProps {
	card: DrawnCard;
	flipped: boolean;
	onPress?: () => void;
}

function canHoverPreview() {
	return window.matchMedia("(hover: hover)").matches;
}

export function TarotCard({ card, flipped, onPress }: TarotCardProps) {
	const { labels } = useLocale();
	const image = getCardImage(card.id as CardId);
	const [hovering, setHovering] = useState(false);
	const previewUpright = hovering && flipped && card.reversed;

	const handlePointerEnter = useCallback(() => {
		if (!flipped || !card.reversed || !canHoverPreview()) return;
		setHovering(true);
	}, [card.reversed, flipped]);

	const handlePointerLeave = useCallback(() => {
		setHovering(false);
	}, []);

	return (
		<div className="tarot-card">
			<button
				type="button"
				className="tarot-card__flip"
				data-flipped={flipped}
				data-reversed={card.reversed}
				data-preview-upright={previewUpright ? "true" : undefined}
				onClick={onPress}
				onPointerEnter={handlePointerEnter}
				onPointerLeave={handlePointerLeave}
				disabled={!onPress}
				aria-label={flipped ? labels.spreadConceal : labels.spreadReveal}
				aria-pressed={flipped}
			>
				<div className="tarot-card__inner">
					<div className="tarot-card__face tarot-card__face--back">
						<CardBack
							size="spread"
							alt={labels.cardBackAlt}
							reversed={card.reversed}
						/>
					</div>
					<div className="tarot-card__face tarot-card__face--front">
						<CardArtMark
							src={image}
							alt=""
							size="spread"
							reversed={card.reversed}
						/>
					</div>
				</div>
			</button>
		</div>
	);
}
