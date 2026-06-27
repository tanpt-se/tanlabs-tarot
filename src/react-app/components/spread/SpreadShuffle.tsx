import { useEffect, useRef, useState } from "react";
import { CardBack } from "../brand/CardBack";
import { useDeckShuffleAnimation } from "../../hooks/use-deck-shuffle";
import { RevealSparkle } from "../vfx/RevealSparkle";

interface SpreadShuffleProps {
	shuffling: boolean;
	alt: string;
}

export function SpreadShuffle({ shuffling, alt }: SpreadShuffleProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const wasShufflingRef = useRef(false);
	const [shuffleSparkle, setShuffleSparkle] = useState(false);

	useDeckShuffleAnimation(
		containerRef,
		shuffling,
		"spread",
		":scope > .spread-shuffle__card",
	);

	useEffect(() => {
		if (wasShufflingRef.current && !shuffling) {
			setShuffleSparkle(true);
		}
		wasShufflingRef.current = shuffling;
	}, [shuffling]);

	return (
		<div className="spread-shuffle-wrap">
			<div
				ref={containerRef}
				className="spread-shuffle"
				data-shuffling={shuffling ? "true" : undefined}
			>
				<div className="spread-shuffle__card">
					<CardBack size="spread" alt={alt} />
				</div>
				<div className="spread-shuffle__card">
					<CardBack size="spread" alt={alt} />
				</div>
				<div className="spread-shuffle__card">
					<CardBack size="spread" alt={alt} />
				</div>
			</div>
			<RevealSparkle
				active={shuffleSparkle}
				onComplete={() => setShuffleSparkle(false)}
			/>
		</div>
	);
}
