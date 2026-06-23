import { CARD_BACK } from "../../assets/brand";

interface CardBackProps {
	alt?: string;
	size?: "hero" | "thumb" | "avatar" | "spread";
}

export function CardBack({
	alt = "Mặt sau lá bài",
	size = "hero",
}: CardBackProps) {
	return (
		<div className={`card-back card-back--${size}`}>
			<div className="card-frame">
				<img className="card-frame__image" src={CARD_BACK} alt={alt} />
			</div>
		</div>
	);
}
