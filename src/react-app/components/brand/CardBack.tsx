import { CARD_BACK } from "../../assets";

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
				<img className="card-frame__image" src={CARD_BACK} alt={alt} />
			</div>
		</div>
	);
}
