import { useLayoutEffect, useRef } from "react";
import {
	CARD_ART_HEIGHT,
	CARD_ART_WIDTH,
} from "../../lib/tarot/card-art-metrics";
import type { CardImage } from "../../lib/tarot/card-image";

interface CardArtMarkProps {
	src: CardImage;
	alt?: string;
	size?: "hero" | "thumb" | "avatar" | "spread";
	reversed?: boolean;
	eager?: boolean;
	onLoad?: () => void;
}

export function CardArtMark({
	src,
	alt = "",
	size = "hero",
	reversed = false,
	eager = false,
	onLoad,
}: CardArtMarkProps) {
	const imgRef = useRef<HTMLImageElement>(null);

	useLayoutEffect(() => {
		const img = imgRef.current;
		if (img?.complete && img.naturalWidth > 0) {
			onLoad?.();
		}
	}, [onLoad, src]);

	return (
		<div
			className={`card-art-mark card-art-mark--${size}`}
			data-reversed={reversed}
		>
			<div className="card-frame">
				<img
					ref={imgRef}
					className="card-frame__image"
					src={src}
					alt={alt}
					width={CARD_ART_WIDTH}
					height={CARD_ART_HEIGHT}
					loading={eager ? "eager" : "lazy"}
					decoding={eager ? "sync" : "async"}
					fetchPriority={eager ? "high" : "low"}
					onLoad={onLoad}
				/>
			</div>
		</div>
	);
}
