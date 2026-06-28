import { CARD_BACK_CLASSIC } from "../../assets";
import {
	CARD_ART_HEIGHT,
	CARD_ART_WIDTH,
} from "../../lib/tarot/card-art-metrics";

interface CardBackProps {
	alt?: string;
	size?: "hero" | "thumb" | "avatar" | "spread" | "title";
	reversed?: boolean;
}

export function CardBack({
	alt = "",
	size = "hero",
	reversed = false,
}: CardBackProps) {
	return (
		<div
			className={`card-back card-back--${size}`}
			data-reversed={reversed}
		>
			<div className="card-frame">
				<img
					className="card-frame__image"
					src={CARD_BACK_CLASSIC}
					alt={alt}
					width={CARD_ART_WIDTH}
					height={CARD_ART_HEIGHT}
				/>
			</div>
		</div>
	);
}
