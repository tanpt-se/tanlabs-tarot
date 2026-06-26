import type { CardImage } from "../../assets/cards";

interface CardArtMarkProps {
	src: CardImage;
	alt?: string;
	size?: "hero" | "thumb" | "avatar" | "spread";
	reversed?: boolean;
	eager?: boolean;
}

export function CardArtMark({
	src,
	alt = "",
	size = "hero",
	reversed = false,
	eager = false,
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
					loading={eager ? "eager" : "lazy"}
					decoding="async"
				/>
			</div>
		</div>
	);
}
