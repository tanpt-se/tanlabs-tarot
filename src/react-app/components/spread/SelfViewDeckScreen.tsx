import { useCallback, useState } from "react";
import { useLocale } from "../../hooks/use-locale";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useSelfViewSession } from "../../hooks/useSelfViewSession";
import { CardBack } from "../brand/CardBack";
import { GameButton } from "../GameButton";
import { CloseIcon } from "../icons/CloseIcon";
import { SelfViewConfirmModal } from "./SelfViewConfirmModal";
import { TarotCard } from "./TarotCard";

export function SelfViewDeckScreen() {
	const { labels } = useLocale();
	const {
		deck,
		drawnCards,
		flippedIndices,
		shuffling,
		revealingIndex,
		isViewingHistory,
		displayedCards,
		shuffleDeck,
		drawOne,
		toggleCardFlip,
		backToCurrent,
		resetLiveSpread,
		archiveCurrentSpread,
		hasOverlayOpen,
	} = useSelfViewSession();
	const [resetModalOpen, setResetModalOpen] = useState(false);

	const handleResetConfirm = useCallback(() => {
		archiveCurrentSpread();
		resetLiveSpread();
		setResetModalOpen(false);
	}, [archiveCurrentSpread, resetLiveSpread]);

	const toggleCardFlipByIndex = useCallback(
		(index: number) => {
			toggleCardFlip(index);
		},
		[toggleCardFlip],
	);

	const handleEscapeToCurrent = useCallback(() => {
		if (!isViewingHistory) return;
		if (hasOverlayOpen()) return;
		if (document.querySelector(".settings-modal")) return;
		backToCurrent();
	}, [backToCurrent, hasOverlayOpen, isViewingHistory]);

	useEscapeKey(handleEscapeToCurrent, isViewingHistory);

	return (
		<>
			<div className="self-view-screen">
				<div className="self-view-deck">
					<button
						type="button"
						className="self-view-deck__stack"
						data-shuffling={shuffling}
						onClick={shuffleDeck}
						disabled={
							isViewingHistory ||
							shuffling ||
							revealingIndex !== null ||
							deck.length === 0
						}
						aria-busy={shuffling}
						aria-label={labels.selfViewShuffleDeck}
					>
						<CardBack size="spread" alt="" />
						<CardBack size="spread" alt="" />
						<CardBack size="spread" alt="" />
					</button>
					<div className="self-view-deck__actions">
						<GameButton
							tone="secondary"
							layout="icon"
							className="self-view-deck__reset"
							onClick={() => setResetModalOpen(true)}
							disabled={isViewingHistory || drawnCards.length === 0}
							aria-label={labels.selfViewReset}
						>
							<CloseIcon />
						</GameButton>
						<GameButton
							tone="primary"
							layout="nav"
							className="self-view-deck__draw"
							onClick={drawOne}
							disabled={
								isViewingHistory ||
								revealingIndex !== null ||
								deck.length === 0
							}
						>
							<span className="game-button__label">
								{revealingIndex !== null
									? labels.loading
									: labels.selfViewDrawOne}
							</span>
						</GameButton>
					</div>
					<p className="self-view-deck__count">
						{labels.selfViewCardsLeft(deck.length)}
					</p>
				</div>

				<div className="self-view-spread-wrap">
					<div
						className="self-view-spread"
						data-count={displayedCards.length || undefined}
						data-viewing={isViewingHistory ? "true" : undefined}
					>
						{displayedCards.length === 0 ? (
							<p className="self-view-spread__empty">
								{isViewingHistory
									? labels.selfViewHistoryEmpty
									: labels.selfViewSpreadEmpty}
							</p>
						) : (
							displayedCards.map((card, index) => (
								<TarotCard
									key={`${card.id}-${index}`}
									card={card}
									index={index}
									revealLoading={revealingIndex === index}
									flipped={
										isViewingHistory ? true : flippedIndices.has(index)
									}
									onPress={
										isViewingHistory ? undefined : toggleCardFlipByIndex
									}
								/>
							))
						)}
					</div>

					{isViewingHistory ? (
						<div className="self-view-spread__back-float">
							<GameButton
								tone="primary"
								layout="nav"
								className="game-button--reader self-view-spread__back"
								onClick={backToCurrent}
							>
								<span className="game-button__label">
									{labels.selfViewBackToCurrent}
								</span>
							</GameButton>
						</div>
					) : null}
				</div>
			</div>

			{resetModalOpen ? (
				<SelfViewConfirmModal
					title={labels.selfViewResetTitle}
					message={labels.selfViewResetMessage}
					confirmLabel={labels.selfViewResetConfirm}
					cancelLabel={labels.selfViewResetCancel}
					onConfirm={handleResetConfirm}
					onCancel={() => setResetModalOpen(false)}
				/>
			) : null}
		</>
	);
}
