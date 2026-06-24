import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { AppChrome } from "../AppChrome";
import { GameButton } from "../GameButton";
import { drawCards } from "../../lib/tarot/draw";
import {
	buildSpreadSummary,
} from "../../lib/tarot/card-text";
import {
	cardCountForSpread,
	inferSpreadTypeFromCardCount,
} from "../../lib/tarot/spread";
import type { NarratorAdvanceConfig } from "../../lib/types/narrator-advance";
import type { DrawnCard, Reading, SpreadType } from "../../lib/types/reading";
import { useLocale } from "../../hooks/use-locale";
import { CardBack } from "../brand/CardBack";
import { GameStage } from "../character/GameStage";
import { ChatInput } from "../chat/ChatInput";
import { JourneyWheel } from "../home/JourneyWheel";
import { TarotCard } from "./TarotCard";

type SpreadPhase =
	| "question"
	| "setup"
	| "shuffle"
	| "drawing"
	| "reveal"
	| "complete";

interface SpreadScreenProps {
	reading: Reading;
	completedReadings: Reading[];
	onUpdate: (id: string, patch: Partial<Reading>) => void;
	onBack: () => void;
	onViewReading: (readingId: string) => void;
	onSettings: () => void;
	isNavigating?: boolean;
	onNarratorMessageChange: (message: string | undefined) => void;
	onNarratorAdvanceChange: (config: NarratorAdvanceConfig | undefined) => void;
}

const DEAL_CARD_INTERVAL_MS = 380;

function inferPhase(reading: Reading): SpreadPhase {
	if (reading.status === "complete") return "complete";
	if (reading.cards.length > 0) return "reveal";
	if (reading.status === "drawing") return "drawing";
	if (reading.spreadType) return "shuffle";
	if (!reading.question.trim()) return "question";
	return "setup";
}

export function SpreadScreen({
	reading,
	completedReadings,
	onUpdate,
	onBack,
	onViewReading,
	onSettings,
	isNavigating = false,
	onNarratorMessageChange,
	onNarratorAdvanceChange,
}: SpreadScreenProps) {
	const { labels, locale } = useLocale();
	const [phase, setPhase] = useState<SpreadPhase>(() => inferPhase(reading));
	const activePhase: SpreadPhase =
		reading.status === "complete" ? "complete" : phase;
	const [pendingCards, setPendingCards] = useState<DrawnCard[]>([]);
	const [dealtCount, setDealtCount] = useState(0);
	const [summaryMessage, setSummaryMessage] = useState<string | undefined>(() =>
		reading.status === "complete" && reading.interpretation
			? reading.interpretation
			: undefined,
	);
	const [flippedIndices, setFlippedIndices] = useState<Set<number>>(() => {
		if (reading.status === "complete") {
			return new Set(reading.cards.map((_, i) => i));
		}
		return new Set();
	});

	const spreadType =
		reading.spreadType ?? inferSpreadTypeFromCardCount(reading.cards.length);
	const totalCards = spreadType ? cardCountForSpread(spreadType) : 0;

	const allFlipped =
		reading.cards.length > 0 && flippedIndices.size >= reading.cards.length;

	const startDrawing = useCallback(() => {
		if (!spreadType) return;

		onUpdate(reading.id, { status: "drawing", cards: [] });
		setPhase("drawing");
		setDealtCount(0);
		setPendingCards(drawCards(totalCards));
		setFlippedIndices(new Set());
		setSummaryMessage(undefined);
	}, [onUpdate, reading.id, spreadType, totalCards]);

	const chooseSpread = useCallback(
		(type: SpreadType) => {
			onUpdate(reading.id, { spreadType: type, status: "pending" });
			setPhase("shuffle");
			setSummaryMessage(undefined);
		},
		[onUpdate, reading.id],
	);

	const submitQuestion = useCallback(
		(question: string) => {
			onUpdate(reading.id, { question: question.trim() });
			setPhase("setup");
			setSummaryMessage(undefined);
		},
		[onUpdate, reading.id],
	);

	useEffect(() => {
		if (activePhase !== "drawing" || pendingCards.length === 0 || !spreadType) {
			return;
		}

		if (dealtCount >= totalCards) {
			return;
		}

		const timer = window.setTimeout(() => {
			const nextCount = dealtCount + 1;
			setDealtCount(nextCount);

			if (nextCount >= totalCards) {
				onUpdate(reading.id, {
					cards: pendingCards,
					status: "interpreting",
				});
				setPhase("reveal");
				setPendingCards([]);
				setDealtCount(0);
				setSummaryMessage(undefined);
			}
		}, DEAL_CARD_INTERVAL_MS);

		return () => window.clearTimeout(timer);
	}, [
		activePhase,
		dealtCount,
		onUpdate,
		pendingCards,
		reading.id,
		spreadType,
		totalCards,
	]);

	const handleCardPress = useCallback((index: number) => {
		setFlippedIndices((prev) => {
			const next = new Set(prev);
			if (next.has(index)) {
				next.delete(index);
			} else {
				next.add(index);
			}
			return next;
		});
	}, []);

	const revealAll = useCallback(() => {
		setFlippedIndices(new Set(reading.cards.map((_, i) => i)));
	}, [reading.cards]);

	const showSummary = useCallback(() => {
		const summary = buildSpreadSummary(
			reading.question,
			reading.cards,
			locale,
		);
		onUpdate(reading.id, { status: "complete", interpretation: summary });
		setSummaryMessage(summary);
		setPhase("complete");
	}, [locale, onUpdate, reading.cards, reading.id, reading.question]);

	const phaseNarratorMessage = useMemo(() => {
		switch (activePhase) {
			case "question":
				return labels.narratorSpreadQuestion;
			case "setup":
				return labels.narratorSpreadSetup;
			case "shuffle":
				return labels.narratorSpreadShuffle;
			case "drawing":
				return labels.narratorSpreadDrawing;
			case "reveal":
				return allFlipped
					? labels.narratorSpreadInterpret
					: labels.narratorSpreadReveal;
			case "complete":
				return labels.narratorSpreadComplete;
		}
	}, [activePhase, allFlipped, labels]);

	const narratorMessage = summaryMessage ?? phaseNarratorMessage;

	const narratorAdvance = useMemo((): NarratorAdvanceConfig | undefined => {
		switch (activePhase) {
			case "shuffle":
				return {
					onAdvance: startDrawing,
					label: labels.spreadReady,
					layout: "icon",
				};
			case "reveal":
				return allFlipped && !summaryMessage
					? {
							onAdvance: showSummary,
							label: labels.spreadSummary,
							layout: "nav",
						}
					: undefined;
			default:
				return undefined;
		}
	}, [
		activePhase,
		allFlipped,
		labels.spreadReady,
		labels.spreadSummary,
		showSummary,
		startDrawing,
		summaryMessage,
	]);

	useLayoutEffect(() => {
		onNarratorMessageChange(narratorMessage);
		return () => onNarratorMessageChange(undefined);
	}, [narratorMessage, onNarratorMessageChange]);

	useLayoutEffect(() => {
		onNarratorAdvanceChange(narratorAdvance);
		return () => onNarratorAdvanceChange(undefined);
	}, [narratorAdvance, onNarratorAdvanceChange]);

	const isEntryPhase = activePhase === "question";

	const spreadChoices = (
		<div className="spread-choices">
			<button
				type="button"
				className="spread-choice"
				onClick={() => chooseSpread("single")}
			>
				<span className="spread-choice__title">{labels.spreadSingle}</span>
				<span className="spread-choice__desc">{labels.spreadSingleDesc}</span>
			</button>
			<button
				type="button"
				className="spread-choice"
				onClick={() => chooseSpread("three")}
			>
				<span className="spread-choice__title">{labels.spreadThree}</span>
				<span className="spread-choice__desc">{labels.spreadThreeDesc}</span>
			</button>
			<button
				type="button"
				className="spread-choice"
				onClick={() => chooseSpread("six")}
			>
				<span className="spread-choice__title">{labels.spreadSix}</span>
				<span className="spread-choice__desc">{labels.spreadSixDesc}</span>
			</button>
		</div>
	);

	const cardsInteractive =
		activePhase === "reveal" || activePhase === "complete";

	return (
		<>
			<AppChrome
				onSettings={onSettings}
				onBack={!isEntryPhase ? onBack : undefined}
				question={
					activePhase !== "question" && reading.question.trim()
						? reading.question
						: undefined
				}
			/>
			<GameStage scrollable>
				<div className="spread-screen">
					<div className="spread-screen__content">
					{activePhase === "question" && (
						<div className="spread-phase spread-phase--center spread-phase--question">
							<p className="spread-phase__title">
								{labels.spreadAskQuestion}
							</p>
							<ChatInput
								onSubmit={submitQuestion}
								placeholder={labels.homePlaceholder}
								sendLabel={labels.sendQuestion}
								autoFocus
							/>
							<JourneyWheel
								readings={completedReadings}
								onSelect={onViewReading}
								disabled={isNavigating}
							/>
						</div>
					)}

				{activePhase === "setup" && (
					<div className="spread-phase spread-phase--top">
						<p className="spread-phase__title">{labels.spreadChooseType}</p>
						{spreadChoices}
					</div>
				)}

				{activePhase === "shuffle" && (
					<div className="spread-phase spread-phase--center">
						<div className="spread-shuffle">
							<CardBack size="spread" alt={labels.cardBackAlt} />
							<CardBack size="spread" alt={labels.cardBackAlt} />
							<CardBack size="spread" alt={labels.cardBackAlt} />
						</div>
						<p className="spread-phase__narration">
							{labels.spreadShuffleNarration}
						</p>
						<GameButton tone="primary" layout="text" onClick={startDrawing}>
							{labels.spreadReady}
						</GameButton>
					</div>
				)}

				{activePhase === "drawing" && (
					<div className="spread-phase spread-phase--center">
						{dealtCount < totalCards && (
							<div className="spread-shuffle spread-shuffle--active">
								<CardBack size="spread" alt={labels.cardBackAlt} />
							</div>
						)}
						<p className="spread-phase__narration">
							{labels.spreadDealingCards(dealtCount, totalCards)}
						</p>
						{dealtCount > 0 && (
							<div
								className="spread-board spread-board--dealing"
								data-count={totalCards}
							>
								{pendingCards.slice(0, dealtCount).map((card, index) => (
									<TarotCard
										key={`${card.id}-${index}`}
										card={card}
										flipped={false}
									/>
								))}
							</div>
						)}
					</div>
				)}

				{cardsInteractive && (
					<div className="spread-phase spread-phase--center spread-phase--board">
						<div
							className="spread-board"
							data-count={reading.cards.length}
						>
							{reading.cards.map((card, index) => (
								<TarotCard
									key={`${card.id}-${index}`}
									card={card}
									flipped={flippedIndices.has(index)}
									onPress={() => handleCardPress(index)}
								/>
							))}
						</div>

						{activePhase === "reveal" && !allFlipped && (
							<div className="spread-phase__actions">
								<GameButton
									tone="secondary"
									layout="text"
									onClick={revealAll}
								>
									{labels.spreadRevealAll}
								</GameButton>
							</div>
						)}
					</div>
				)}
				</div>
			</div>
		</GameStage>
		</>
	);
}
