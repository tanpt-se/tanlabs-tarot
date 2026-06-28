import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
} from "react";
import { createPortal } from "react-dom";
import type { DrawnCard } from "../../lib/types/reading";
import { useReversedUprightHold } from "../../hooks/use-reversed-upright-hold";
import { getSelfViewSingleCardWidth } from "../../lib/self-view/spread-layout";
import { TarotCard } from "./TarotCard";

export interface SelfViewCardFocusOverlayHandle {
	close: () => Promise<void>;
}

interface SelfViewCardFocusOverlayProps {
	card: DrawnCard;
	index: number;
	flipped: boolean;
	onClosingStart: () => void;
	onHandoff: () => void;
	onClosed: () => void;
}

export const SelfViewCardFocusOverlay = forwardRef<
	SelfViewCardFocusOverlayHandle,
	SelfViewCardFocusOverlayProps
>(function SelfViewCardFocusOverlay(
	{ card, index, flipped, onClosingStart, onHandoff, onClosed },
	ref,
) {
	const { held: reversedUprightHeld } = useReversedUprightHold();
	const closingRef = useRef(false);
	const focusWidthPx = getSelfViewSingleCardWidth();

	const runClose = useCallback(() => {
		if (closingRef.current) return;
		closingRef.current = true;

		onClosingStart();
		onHandoff();
		onClosed();
	}, [onClosed, onClosingStart, onHandoff]);

	useImperativeHandle(ref, () => ({ close: async () => runClose() }), [runClose]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			runClose();
		};

		document.addEventListener("keydown", onKeyDown, true);
		return () => document.removeEventListener("keydown", onKeyDown, true);
	}, [runClose]);

	return createPortal(
		<div
			className="self-view-card-focus-layer"
			role="presentation"
			onClick={() => {
				runClose();
			}}
		>
			<div
				className="self-view-card-focus-layer__card self-view-card-focus-layer__card--static"
				style={{ width: focusWidthPx }}
				onClick={(event) => {
					event.stopPropagation();
					runClose();
				}}
			>
				<TarotCard
					card={card}
					index={index}
					flipped={flipped}
					flipMode="css-3d"
					instantFlip
					loadWhenVisible
					disableHoverPreview
					uprightPreview={reversedUprightHeld && flipped && card.reversed}
					onPress={() => {
						runClose();
					}}
				/>
			</div>
		</div>,
		document.body,
	);
});
