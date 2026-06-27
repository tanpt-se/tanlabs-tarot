import { CARD_BACK, CARD_BACK_CLASSIC } from "../../assets";
import { useTheme } from "../../hooks/use-theme";

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
	const { theme } = useTheme();
	const src = theme === "mystic" ? CARD_BACK : CARD_BACK_CLASSIC;

	return (
		<div
			className={`card-back card-back--${size}`}
			data-reversed={reversed}
			data-theme={theme}
		>
			<div className="card-frame">
				<img className="card-frame__image" src={src} alt={alt} />
			</div>
		</div>
	);
}
