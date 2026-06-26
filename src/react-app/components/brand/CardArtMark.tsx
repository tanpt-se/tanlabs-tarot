import type { CardImage } from "../../assets/cards";

interface CardArtMarkProps {
	src: CardImage;
	alt?: string;
	size?: "hero" | "thumb" | "avatar" | "spread";
	reversed?: boolean;
}

export function CardArtMark({
	src,
	alt = "",
	size = "hero",
	reversed = false,
}: CardArtMarkProps) {
	return (
		<div
			className={`card-art-mark card-art-mark--${size}`}
			data-reversed={reversed}
		>
			<div className="card-frame">
				<img
					className="card-frame__image"
					src={src}
					alt={alt}
					loading="lazy"
					decoding="async"
				/>
			</div>
		</div>
	);
}
