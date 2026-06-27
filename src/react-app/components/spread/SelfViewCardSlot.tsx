import { useCallback } from "react";

type SelfViewCardSlotProps = {
	index: number;
	onRootElement?: (index: number, element: HTMLDivElement | null) => void;
};

/** Invisible layout spacer — reserves the next spread slot before the card mounts. */
export function SelfViewCardSlot({
	index,
	onRootElement,
}: SelfViewCardSlotProps) {
	const setRoot = useCallback(
		(element: HTMLDivElement | null) => {
			onRootElement?.(index, element);
		},
		[index, onRootElement],
	);

	return (
		<div
			ref={setRoot}
			className="tarot-card self-view-card-slot"
			data-self-view-slot-placeholder="true"
			aria-hidden
		/>
	);
}
