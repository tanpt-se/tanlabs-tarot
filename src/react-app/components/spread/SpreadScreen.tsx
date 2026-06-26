import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppChrome } from "../AppChrome";
import { loadCardImage, preloadCardImages } from "../../lib/tarot/card-image";
import type { CardId } from "../../lib/tarot/deck";
import { drawCards } from "../../lib/tarot/draw";
import {
	buildCardInterpretation,
	buildInterpretation,
} from "../../lib/tarot/card-text";
import {
	cardCountForSpread,
	getSpreadPositionLabels,
	inferSpreadTypeFromCardCount,
} from "../../lib/tarot/spread";
import type { NarratorAdvanceConfig } from "../../lib/types/narrator-advance";
import type { NarratorChoicesConfig } from "../../lib/types/narrator-choice";
import type { Reading, SpreadType } from "../../lib/types/reading";
import { useLocale } from "../../hooks/use-locale";
import { CardBack } from "../brand/CardBack";
import { NarratorShell } from "../character/NarratorShell";
import { GameStage } from "../character/GameStage";
import { ChatInput } from "../chat/ChatInput";
import { JourneyWheel } from "../home/JourneyWheel";
import { TarotCard } from "./TarotCard";

type SpreadPhase =
	| "question"
	| "setup"
	| "shuffle"
	| "reveal"
	| "interpret-choice"
	| "interpret-sequential"
	| "complete";

interface SpreadScreenProps {
	reading: Reading;
	completedReadings: Reading[];
	onUpdate: (id: string, patch: Partial<Reading>) => void;
	onBack: () => void;
	onViewReading: (readingId: string) => void;
	onSettings: () => void;
	isNavigating?: boolean;
}

function inferPhase(reading: Reading): SpreadPhase {
	if (reading.status === "complete") return "complete";
	if (reading.cards.length > 0) return "reveal";
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
}: SpreadScreenProps) {
	const { labels, locale } = useLocale();
	const [phase, setPhase] = useState<SpreadPhase>(() => inferPhase(reading));
	const activePhase: SpreadPhase =
		reading.status === "complete" ? "complete" : phase;
	const [shuffling, setShuffling] = useState(false);
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
	const [revealingIndex, setRevealingIndex] = useState<number | null>(null);
	const [interpretCardIndex, setInterpretCardIndex] = useState(0);
	const [selectedSpreadType, setSelectedSpreadType] = useState<SpreadType | null>(
		() => reading.spreadType,
	);
	const autoRevealStartedRef = useRef(false);
	const revealingIndexRef = useRef<number | null>(null);
	const shufflingRef = useRef(false);

	useEffect(() => {
		revealingIndexRef.current = revealingIndex;
	}, [revealingIndex]);

	useEffect(() => {
		shufflingRef.current = shuffling;
	}, [shuffling]);

	useEffect(() => {
		if (reading.spreadType) {
			setSelectedSpreadType(reading.spreadType);
		}
	}, [reading.spreadType]);

	const spreadType =
		selectedSpreadType ??
		reading.spreadType ??
		inferSpreadTypeFromCardCount(reading.cards.length);

	const positionLabels = useMemo(
		() => (spreadType ? getSpreadPositionLabels(spreadType, labels) : []),
		[labels, spreadType],
	);

	const shufflingTimerRef = useMemo(() => ({ current: 0 }), []);

	const startAutoReveal = useCallback(() => {
		if (reading.cards.length === 0 || autoRevealStartedRef.current) return;
		autoRevealStartedRef.current = true;
		setRevealingIndex(0);
	}, [reading.cards.length]);

	const completeCardReveal = useCallback((index: number) => {
		setFlippedIndices((current) => {
			const next = new Set(current);
			next.add(index);
			return next;
		});
	}, []);

	const completeRevealFlip = useCallback(
		(index: number) => {
			if (revealingIndexRef.current !== index) return;

			const nextIndex = index + 1;
			if (nextIndex < reading.cards.length) {
				setRevealingIndex(nextIndex);
				return;
			}

			setRevealingIndex(null);
			setPhase("interpret-choice");
		},
		[reading.cards.length],
	);

	const startDrawingRef = useRef<() => void>(() => {});

	const startDrawing = useCallback(() => {
		const type =
			selectedSpreadType ??
			reading.spreadType ??
			inferSpreadTypeFromCardCount(reading.cards.length);
		if (!type || shufflingRef.current) return;

		const count = cardCountForSpread(type);
		setShuffling(true);
		autoRevealStartedRef.current = false;
		clearTimeout(shufflingTimerRef.current);

		const cards = drawCards(count);
		const preloadPromise = preloadCardImages(
			cards.map((card) => card.id as CardId),
		).catch(() => undefined);

		shufflingTimerRef.current = window.setTimeout(() => {
			void (async () => {
				try {
					await preloadPromise;
					onUpdate(reading.id, { cards, spreadType: type, status: "interpreting" });
					setPhase("reveal");
					setFlippedIndices(new Set());
					setRevealingIndex(null);
					setSummaryMessage(undefined);
					setInterpretCardIndex(0);
				} finally {
					setShuffling(false);
				}
			})();
		}, 900);
	}, [onUpdate, reading.cards.length, reading.id, reading.spreadType, selectedSpreadType, shufflingTimerRef]);

	startDrawingRef.current = startDrawing;

	useEffect(() => {
		if (activePhase !== "reveal" || reading.cards.length === 0) return;
		if (revealingIndex !== null) return;

		const timeout = window.setTimeout(() => {
			startAutoReveal();
		}, 500 + reading.cards.length * 120);

		return () => {
			window.clearTimeout(timeout);
		};
	}, [activePhase, reading.cards.length, revealingIndex, startAutoReveal]);

	useEffect(() => {
		return () => {
			window.clearTimeout(shufflingTimerRef.current);
		};
	}, [shufflingTimerRef]);

	useEffect(() => {
		if (activePhase !== "reveal" || revealingIndex === null) return;

		const nextCard = reading.cards[revealingIndex + 1];
		if (!nextCard) return;

		void loadCardImage(nextCard.id as CardId);
	}, [activePhase, reading.cards, revealingIndex]);

	const chooseSpread = useCallback(
		(type: SpreadType) => {
			setSelectedSpreadType(type);
			onUpdate(reading.id, { spreadType: type, status: "pending" });
			setPhase("shuffle");
			setSummaryMessage(undefined);
			autoRevealStartedRef.current = false;
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

	const finishReading = useCallback(
		(interpretation: string) => {
			onUpdate(reading.id, { status: "complete", interpretation });
			setSummaryMessage(interpretation);
			setPhase("complete");
		},
		[onUpdate, reading.id],
	);

	const chooseSequentialInterpret = useCallback(() => {
		setInterpretCardIndex(0);
		setPhase("interpret-sequential");
	}, []);

	const chooseSummaryInterpret = useCallback(() => {
		const interpretation = buildInterpretation(
			reading.question,
			reading.cards,
			positionLabels,
			locale,
		);
		finishReading(interpretation);
	}, [finishReading, locale, positionLabels, reading.cards, reading.question]);

	const advanceSequentialInterpret = useCallback(() => {
		const isLast = interpretCardIndex >= reading.cards.length - 1;
		if (!isLast) {
			setInterpretCardIndex((current) => current + 1);
			return;
		}

		const interpretation = buildInterpretation(
			reading.question,
			reading.cards,
			positionLabels,
			locale,
		);
		finishReading(interpretation);
	}, [
		finishReading,
		interpretCardIndex,
		locale,
		positionLabels,
		reading.cards,
		reading.question,
	]);

	const sequentialCardMessage = useMemo(() => {
		if (activePhase !== "interpret-sequential") return undefined;

		const card = reading.cards[interpretCardIndex];
		if (!card) return undefined;

		const position = positionLabels[interpretCardIndex] ?? "";
		const meaning = buildCardInterpretation(card, locale);
		return position ? `${position}\n\n${meaning}` : meaning;
	}, [
		activePhase,
		interpretCardIndex,
		locale,
		positionLabels,
		reading.cards,
	]);

	const phaseNarratorMessage = useMemo(() => {
		switch (activePhase) {
			case "question":
				return labels.narratorSpreadQuestion;
			case "setup":
				return labels.narratorSpreadSetup;
			case "shuffle":
				return labels.narratorSpreadShuffle;
			case "reveal":
				return revealingIndex !== null
					? labels.narratorSpreadDrawing
					: labels.narratorSpreadReveal;
			case "interpret-choice":
				return labels.narratorSpreadInterpretChoice;
			case "interpret-sequential":
				return labels.narratorSpreadInterpret;
			case "complete":
				return labels.narratorSpreadComplete;
		}
	}, [activePhase, labels, revealingIndex]);

	const narratorMessage =
		summaryMessage ?? sequentialCardMessage ?? phaseNarratorMessage;

	const advanceSequentialRef = useRef(advanceSequentialInterpret);
	advanceSequentialRef.current = advanceSequentialInterpret;

	const narratorAdvance = useMemo((): NarratorAdvanceConfig | undefined => {
		switch (activePhase) {
			case "shuffle":
				return {
					onAdvance: () => startDrawingRef.current(),
					label: labels.spreadReady,
					disabled: shuffling,
					layout: "nav",
					showIcon: true,
					blockWhileTyping: false,
				};
			case "interpret-sequential":
				return {
					onAdvance: () => advanceSequentialRef.current(),
					label:
						interpretCardIndex >= reading.cards.length - 1
							? labels.spreadInterpretSeeSummary
							: labels.spreadInterpretNext,
					layout: "nav",
				};
			default:
				return undefined;
		}
	}, [
		activePhase,
		interpretCardIndex,
		labels.spreadInterpretNext,
		labels.spreadInterpretSeeSummary,
		labels.spreadReady,
		reading.cards.length,
		shuffling,
	]);

	const narratorChoices = useMemo((): NarratorChoicesConfig | undefined => {
		if (activePhase !== "interpret-choice") return undefined;

		return {
			options: [
				{
					title: labels.spreadInterpretSequential,
					description: labels.spreadInterpretSequentialDesc,
					onSelect: chooseSequentialInterpret,
				},
				{
					title: labels.spreadInterpretSummary,
					description: labels.spreadInterpretSummaryDesc,
					onSelect: chooseSummaryInterpret,
				},
			],
		};
	}, [
		activePhase,
		chooseSequentialInterpret,
		chooseSummaryInterpret,
		labels.spreadInterpretSequential,
		labels.spreadInterpretSequentialDesc,
		labels.spreadInterpretSummary,
		labels.spreadInterpretSummaryDesc,
	]);

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

	const showBoard =
		activePhase === "reveal" ||
		activePhase === "interpret-choice" ||
		activePhase === "interpret-sequential" ||
		activePhase === "complete";

	return (
		<div className="spread-layout">
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
								<p className="spread-phase__title">
									{labels.spreadChooseType}
								</p>
								{spreadChoices}
							</div>
						)}

						{activePhase === "shuffle" && (
							<div className="spread-phase spread-phase--center">
								<div
									className="spread-shuffle"
									data-shuffling={shuffling ? "true" : undefined}
								>
									<CardBack size="spread" alt={labels.cardBackAlt} />
									<CardBack size="spread" alt={labels.cardBackAlt} />
									<CardBack size="spread" alt={labels.cardBackAlt} />
								</div>
								{shuffling ? (
									<p className="spread-phase__narration">
										{labels.spreadShuffleNarration}
									</p>
								) : null}
							</div>
						)}

						{showBoard && reading.cards.length > 0 && (
							<div
								className="spread-phase spread-phase--center spread-phase--board"
								data-interpret-index={
									activePhase === "interpret-sequential"
										? interpretCardIndex
										: undefined
								}
							>
								<div
									className="spread-board"
									data-count={reading.cards.length}
								>
									{reading.cards.map((card, index) => (
										<TarotCard
											key={`${card.id}-${index}`}
											card={card}
											index={index}
											dealIndex={
												activePhase === "reveal" ? index : undefined
											}
											flipped={
												flippedIndices.has(index) ||
												activePhase === "complete"
											}
											revealLoading={
												activePhase === "reveal" &&
												revealingIndex === index
											}
											onRevealReady={completeCardReveal}
											onRevealFlipComplete={completeRevealFlip}
										/>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</GameStage>
			<NarratorShell
				message={narratorMessage}
				advance={narratorAdvance}
				choices={narratorChoices}
			/>
		</div>
	);
};
