import type { CardImage } from "../../assets/cards";
import { MAJOR } from "../../assets/cards";

interface CardArtMarkProps {
	src?: CardImage;
	alt?: string;
	size?: "hero" | "thumb" | "avatar" | "spread";
	reversed?: boolean;
}

export function CardArtMark({
	src = MAJOR.THE_FOOL,
	alt = "The Fool",
	size = "hero",
	reversed = false,
}: CardArtMarkProps) {
	return (
		<div
			className={`card-art-mark card-art-mark--${size}`}
			data-reversed={reversed}
		>
			<div className="card-frame">
				<img className="card-frame__image" src={src} alt={alt} />
			</div>
		</div>
	);
}
