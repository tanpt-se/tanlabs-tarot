import type { CardImage } from "../../assets/cards";
import { MAJOR } from "../../assets/cards";

interface CardArtMarkProps {
	src?: CardImage;
	alt?: string;
	size?: "hero" | "thumb" | "avatar";
}

export function CardArtMark({
	src = MAJOR.THE_FOOL,
	alt = "The Fool",
	size = "hero",
}: CardArtMarkProps) {
	return (
		<div className={`card-art-mark card-art-mark--${size}`}>
			<div className="card-frame">
				<img className="card-frame__image" src={src} alt={alt} />
			</div>
		</div>
	);
}
