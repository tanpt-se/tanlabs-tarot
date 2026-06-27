import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import {
	animateCardFocusIn,
	animateCardFocusOut,
	applyCardFocusStartPose,
	type CardFocusRect,
	hideCardFocusShell,
	waitForPaint,
} from "../../lib/animation/card-focus";
import type { DrawnCard } from "../../lib/types/reading";
import { useReversedUprightHold } from "../../hooks/use-reversed-upright-hold";
import { TarotCard } from "./TarotCard";

export interface SelfViewCardFocusOverlayHandle {
	close: () => Promise<void>;
}

interface SelfViewCardFocusOverlayProps {
	card: DrawnCard;
	index: number;
	flipped: boolean;
	origin: CardFocusRect;
	getCloseOrigin: () => CardFocusRect;
	onClosingStart: () => void;
	onHandoff: () => void;
	onClosed: () => void;
}

export const SelfViewCardFocusOverlay = forwardRef<
	SelfViewCardFocusOverlayHandle,
	SelfViewCardFocusOverlayProps
>(function SelfViewCardFocusOverlay(
	{
		card,
		index,
		flipped,
		origin,
		getCloseOrigin,
		onClosingStart,
		onHandoff,
		onClosed,
	},
	ref,
) {
	const { held: reversedUprightHeld } = useReversedUprightHold();
	const shellRef = useRef<HTMLDivElement>(null);
	const closingRef = useRef(false);
	const [poseReady, setPoseReady] = useState(false);

	const runClose = useCallback(async () => {
		if (closingRef.current || !shellRef.current) return;
		closingRef.current = true;

		onClosingStart();
		await waitForPaint();

		const closeOrigin = getCloseOrigin();
		await animateCardFocusOut(shellRef.current, closeOrigin);

		onHandoff();
		hideCardFocusShell(shellRef.current);
		await waitForPaint();
		onClosed();
	}, [getCloseOrigin, onClosed, onClosingStart, onHandoff]);

	useImperativeHandle(ref, () => ({ close: runClose }), [runClose]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			void runClose();
		};

		document.addEventListener("keydown", onKeyDown, true);
		return () => document.removeEventListener("keydown", onKeyDown, true);
	}, [runClose]);

	useLayoutEffect(() => {
		const shell = shellRef.current;
		if (!shell) return;

		shell.style.visibility = "visible";
		shell.style.pointerEvents = "auto";
		applyCardFocusStartPose(shell, origin);
		setPoseReady(true);

		const frame = requestAnimationFrame(() => {
			if (!shellRef.current) return;
			animateCardFocusIn(shellRef.current, origin);
		});

		return () => {
			cancelAnimationFrame(frame);
		};
	}, [origin]);

	return createPortal(
		<div
			className="self-view-card-focus-layer"
			role="presentation"
			onClick={() => {
				void runClose();
			}}
		>
			<div
				ref={shellRef}
				className="self-view-card-focus-layer__card"
				data-pose-ready={poseReady ? "true" : undefined}
				onClick={(event) => {
					event.stopPropagation();
					void runClose();
				}}
			>
				<TarotCard
					card={card}
					index={index}
					flipped={flipped}
					loadWhenVisible
					disableHoverPreview
					uprightPreview={reversedUprightHeld && flipped && card.reversed}
					onPress={() => {
						void runClose();
					}}
				/>
			</div>
		</div>,
		document.body,
	);
});
