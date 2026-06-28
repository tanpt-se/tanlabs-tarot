import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
	animateCardDealFlight,
	positionDealFlightGhost,
} from "../../lib/animation/card-deal-flight";
import { CardBack } from "../brand/CardBack";
import { useLocale } from "../../hooks/use-locale";

export type SelfViewDealFlightTarget = {
	fromRect: DOMRect;
	toRect: DOMRect;
	slotIndex: number;
};

type SelfViewDealGhostProps = {
	flight: SelfViewDealFlightTarget;
	onComplete: (slotIndex: number) => void;
};

export function SelfViewDealGhost({ flight, onComplete }: SelfViewDealGhostProps) {
	const { labels } = useLocale();
	const ghostRef = useRef<HTMLDivElement>(null);
	const completedRef = useRef(false);

	useLayoutEffect(() => {
		const ghost = ghostRef.current;
		if (!ghost) return;

		positionDealFlightGhost(ghost, flight.fromRect);

		const timeline = animateCardDealFlight({
			ghost,
			fromRect: flight.fromRect,
			toRect: flight.toRect,
			onComplete: () => {
				if (completedRef.current) return;
				completedRef.current = true;
				onComplete(flight.slotIndex);
			},
		});

		return () => {
			timeline.kill();
			if (!completedRef.current) {
				completedRef.current = true;
				onComplete(flight.slotIndex);
			}
		};
	}, [flight, onComplete]);

	return createPortal(
		<div ref={ghostRef} className="self-view-deal-ghost" aria-hidden>
			<div className="self-view-deal-ghost__card">
				<CardBack size="spread" alt={labels.cardBackAlt} />
			</div>
		</div>,
		document.body,
	);
}
