import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { DrawnCard } from "../../lib/types/reading";
import { getCardImage, loadCardImage } from "../../lib/tarot/card-image";
import type { CardId } from "../../lib/tarot/deck";
import { useLocale } from "../../hooks/use-locale";
import { CardBack } from "../brand/CardBack";
import { CardArtMark } from "../brand/CardArtMark";

interface TarotCardProps {
	card: DrawnCard;
	flipped: boolean;
	index?: number;
	dealIndex?: number;
	onPress?: (index: number) => void;
}

function canHoverPreview() {
	return window.matchMedia("(hover: hover)").matches;
}

export const TarotCard = memo(function TarotCard({
	card,
	flipped,
	index = 0,
	dealIndex,
	onPress,
}: TarotCardProps) {
	const { labels } = useLocale();
	const cardId = card.id as CardId;
	const [imageSrc, setImageSrc] = useState<string | undefined>(() =>
		flipped ? getCardImage(cardId) : undefined,
	);
	const [hovering, setHovering] = useState(false);
	const previewUpright = hovering && flipped && card.reversed;

	const style = useMemo(
		() =>
			dealIndex === undefined
				? undefined
				: ({ "--deal-index": dealIndex } as React.CSSProperties),
		[dealIndex],
	);

	useEffect(() => {
		if (!flipped) {
			setImageSrc(undefined);
			return;
		}

		const cached = getCardImage(cardId);
		if (cached) {
			setImageSrc(cached);
			return;
		}

		let cancelled = false;
		void loadCardImage(cardId).then((src) => {
			if (!cancelled) {
				setImageSrc(src);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [cardId, flipped]);

	const handleClick = useCallback(() => {
		onPress?.(index);
	}, [index, onPress]);

	const handlePointerEnter = useCallback(() => {
		if (!flipped || !card.reversed || !canHoverPreview()) return;
		setHovering(true);
	}, [card.reversed, flipped]);

	const handlePointerLeave = useCallback(() => {
		setHovering(false);
	}, []);

	return (
		<div className="tarot-card" style={style}>
			<button
				type="button"
				className="tarot-card__flip"
				data-flipped={flipped}
				data-reversed={card.reversed}
				data-preview-upright={previewUpright ? "true" : undefined}
				onClick={onPress ? handleClick : undefined}
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
					{flipped && imageSrc ? (
						<div className="tarot-card__face tarot-card__face--front">
							<CardArtMark
								src={imageSrc}
								alt=""
								size="spread"
								reversed={card.reversed}
							/>
						</div>
					) : null}
				</div>
			</button>
		</div>
	);
});
