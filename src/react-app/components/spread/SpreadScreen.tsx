import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppChrome } from "../AppChrome";
import { HistoryButton } from "../HistoryButton";
import { useAppChromeShortcuts } from "../../hooks/use-app-chrome-shortcuts";
import { useBackgroundMusic } from "../../hooks/use-background-music";
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
	isDailySpread,
} from "../../lib/tarot/spread";
import type { NarratorAdvanceConfig } from "../../lib/types/narrator-advance";
import type { Reading, SpreadType, DrawnCard } from "../../lib/types/reading";
import { useLocale } from "../../hooks/use-locale";
import { useReversedUprightHold } from "../../hooks/use-reversed-upright-hold";
import { useSfx } from "../../hooks/use-sfx";
import { SPREAD_SHUFFLE_DURATION_MS } from "../../lib/animation/constants";
import { SpreadShuffle } from "./SpreadShuffle";
import { NarratorShell } from "../character/NarratorShell";
import { NarratorChoiceList } from "../character/NarratorChoiceList";
import { GuidedPromptBubble } from "../character/GuidedPromptBubble";
import { GuidedClarifyFeed } from "../character/GuidedClarifyFeed";
import {
	buildClarifyingQuestion,
	getClarifyingPlaceholder,
	getClarifyingStepIds,
	spreadUsesClarifyingFlow,
} from "../../lib/guided/clarifying-flow";
import { GameStage } from "../character/GameStage";
import { ChatInput } from "../chat/ChatInput";
import { TarotCard } from "./TarotCard";
import { ReadingPanel } from "./ReadingPanel";
import { GameButton } from "../GameButton";
import { GameToast } from "../GameToast";
import { GuidedReadingHistoryModal } from "./GuidedReadingHistoryModal";
import {
	getTodayDailyCard,
	hasTodayDailyCard,
} from "../../lib/storage/daily-card-store";
import { resolveTodayDailyCard } from "../../lib/guided/daily-reading";
import {
	GUIDED_SIX_CARD_ENABLED,
	GUIDED_THREE_CARD_ENABLED,
} from "../../lib/features/guided-reading";
import { isGameModalOpen } from "../../lib/keyboard/app-shortcut";

type SpreadPhase =
	| "question"
	| "setup"
	| "shuffle"
	| "reveal"
	| "interpret-choice"
	| "interpret-sequential"
	| "daily-reading"
	| "complete";

interface SpreadScreenProps {
	reading: Reading;
	completedReadings: Reading[];
	onUpdate: (id: string, patch: Partial<Reading>) => void;
	onBack: () => void;
	onSelectHistoryReading: (readingId: string) => void;
	onClearReadingHistory: () => void;
	onSettings: () => void;
	isSettingsOpen: boolean;
	onCloseSettings: () => void;
	entranceReady?: boolean;
}

function inferPhase(reading: Reading): SpreadPhase {
	if (reading.status === "complete") return "complete";
	if (reading.cards.length > 0) return "reveal";
	if (reading.spreadType && spreadUsesClarifyingFlow(reading.spreadType)) {
		if (!reading.question.trim()) return "question";
		return "shuffle";
	}
	if (reading.spreadType && reading.question.trim()) return "shuffle";
	if (reading.spreadType) return "question";
	return "setup";
}

export function SpreadScreen({
	reading,
	completedReadings,
	onUpdate,
	onBack,
	onSelectHistoryReading,
	onClearReadingHistory,
	onSettings,
	isSettingsOpen,
	onCloseSettings,
	entranceReady = true,
}: SpreadScreenProps) {
	const { labels, locale } = useLocale();
	const { enabled: musicEnabled, toggle: toggleMusic } = useBackgroundMusic();
	const [muteToast, setMuteToast] = useState<{
		id: number;
		message: string;
	} | null>(null);
	const [historyOpen, setHistoryOpen] = useState(false);
	const { held: reversedUprightHeld } = useReversedUprightHold();
	const { playFlip, playShuffle, playReveal } = useSfx();
	const [phase, setPhase] = useState<SpreadPhase>(() => inferPhase(reading));
	const activePhase: SpreadPhase =
		reading.status === "complete" ? "complete" : phase;
	const showHistoryChrome =
		completedReadings.length > 0 && activePhase !== "interpret-choice";
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

	const handleMuteHotkey = useCallback(() => {
		setMuteToast({
			id: Date.now(),
			message: musicEnabled
				? labels.musicMutedToast
				: labels.musicUnmutedToast,
		});
		toggleMusic();
	}, [
		labels.musicMutedToast,
		labels.musicUnmutedToast,
		musicEnabled,
		toggleMusic,
	]);

	const handleSettingsHotkey = useCallback(() => {
		if (isSettingsOpen) {
			onCloseSettings();
			return;
		}

		if (isGameModalOpen()) return;

		onSettings();
	}, [isSettingsOpen, onCloseSettings, onSettings]);

	const handleHistoryHotkey = useCallback(() => {
		if (activePhase === "interpret-choice") return;
		if (completedReadings.length === 0) return;

		if (historyOpen) {
			setHistoryOpen(false);
			return;
		}

		if (isGameModalOpen()) return;

		setHistoryOpen(true);
	}, [activePhase, completedReadings.length, historyOpen]);

	useAppChromeShortcuts({
		onSettings: handleSettingsHotkey,
		onHistory: showHistoryChrome ? handleHistoryHotkey : undefined,
		onMute: handleMuteHotkey,
	});

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
		playFlip();
		setFlippedIndices((current) => {
			const next = new Set(current);
			next.add(index);
			return next;
		});
	}, [playFlip]);

	const completeRevealFlip = useCallback(
		(index: number) => {
			if (revealingIndexRef.current !== index) return;

			const nextIndex = index + 1;
			if (nextIndex < reading.cards.length) {
				setRevealingIndex(nextIndex);
				return;
			}

			setRevealingIndex(null);
			if (isDailySpread(spreadType) || reading.cards.length === 1) {
				setInterpretCardIndex(0);
				setPhase("interpret-sequential");
			} else {
				setPhase("interpret-choice");
			}
			playReveal();
		},
		[playReveal, reading.cards.length, spreadType],
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
		playShuffle();
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
		}, SPREAD_SHUFFLE_DURATION_MS);
	}, [onUpdate, playShuffle, reading.cards.length, reading.id, reading.spreadType, selectedSpreadType, shufflingTimerRef]);

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

	const beginDailyReading = useCallback(
		(card: DrawnCard) => {
			void preloadCardImages([card.id as CardId]).catch(() => undefined);
			onUpdate(reading.id, {
				clarifyingAnswers: [],
				question: "",
				cards: [card],
				spreadType: "single",
				status: "complete",
			});
			setSummaryMessage(undefined);
			setPhase("daily-reading");
		},
		[onUpdate, reading.id],
	);

	const chooseSpread = useCallback(
		(type: SpreadType) => {
			if (type === "three" && !GUIDED_THREE_CARD_ENABLED) return;
			if (type === "six" && !GUIDED_SIX_CARD_ENABLED) return;

			setSelectedSpreadType(type);

			if (type === "single") {
				const todayCard = getTodayDailyCard();
				if (todayCard) {
					beginDailyReading(todayCard);
					autoRevealStartedRef.current = false;
					return;
				}
			}

			onUpdate(reading.id, {
				spreadType: type,
				question: "",
				clarifyingAnswers: [],
				cards: [],
				status: "pending",
			});
			setPhase(
				spreadUsesClarifyingFlow(type) ? "question" : "shuffle",
			);
			setSummaryMessage(undefined);
			autoRevealStartedRef.current = false;
		},
		[beginDailyReading, onUpdate, reading.id],
	);

	const clarifyingStepIds = useMemo(
		() => (spreadType ? getClarifyingStepIds(spreadType) : []),
		[spreadType],
	);

	const clarifyingAnswers = reading.clarifyingAnswers;

	const activeClarifyingStepId =
		clarifyingStepIds[clarifyingAnswers.length] ?? null;

	const clarifyingPlaceholder = activeClarifyingStepId
		? getClarifyingPlaceholder(activeClarifyingStepId, labels)
		: labels.homePlaceholder;

	const submitClarifyingAnswer = useCallback(
		(answer: string) => {
			const trimmed = answer.trim();
			if (!trimmed || !spreadType || !spreadUsesClarifyingFlow(spreadType)) {
				return;
			}

			const stepIds = getClarifyingStepIds(spreadType);
			const nextAnswers = [...clarifyingAnswers, trimmed];

			if (nextAnswers.length >= stepIds.length) {
				onUpdate(reading.id, {
					clarifyingAnswers: nextAnswers,
					question: buildClarifyingQuestion(nextAnswers),
				});
				setPhase("shuffle");
				setSummaryMessage(undefined);
				return;
			}

			onUpdate(reading.id, { clarifyingAnswers: nextAnswers });
		},
		[clarifyingAnswers, onUpdate, reading.id, spreadType],
	);

	const drawRandomDailyCard = useCallback(() => {
		if (spreadType !== "single") return;

		beginDailyReading(resolveTodayDailyCard());
		playShuffle();
	}, [beginDailyReading, playShuffle, spreadType]);

	const showDailyDrawRandom =
		activePhase === "question" &&
		spreadType === "single" &&
		clarifyingAnswers.length === 0 &&
		!hasTodayDailyCard();

	const dailyReadingCard =
		activePhase === "daily-reading" ? reading.cards[0] : undefined;

	const backToSpreadSetup = useCallback(() => {
		window.clearTimeout(shufflingTimerRef.current);
		setShuffling(false);
		onUpdate(reading.id, {
			spreadType: null,
			question: "",
			clarifyingAnswers: [],
			cards: [],
			status: "pending",
			interpretation: null,
		});
		setPhase("setup");
		setSelectedSpreadType(null);
		setSummaryMessage(undefined);
		setFlippedIndices(new Set());
		setRevealingIndex(null);
		setInterpretCardIndex(0);
		autoRevealStartedRef.current = false;
	}, [onUpdate, reading.id, shufflingTimerRef]);

	const handleBack = useCallback(() => {
		if (activePhase === "setup") {
			onBack();
			return;
		}
		backToSpreadSetup();
	}, [activePhase, backToSpreadSetup, onBack]);

	const finishReading = useCallback(
		(interpretation: string) => {
			onUpdate(reading.id, { status: "complete", interpretation });
			setSummaryMessage(interpretation);
			setPhase("complete");
		},
		[onUpdate, reading.id],
	);

	const isSingleCardInterpret =
		activePhase === "interpret-sequential" && reading.cards.length === 1;

	useEffect(() => {
		if (!isSingleCardInterpret || reading.status === "complete") return;

		const interpretation = buildInterpretation(
			reading.question,
			reading.cards,
			positionLabels,
			locale,
		);
		onUpdate(reading.id, { status: "complete", interpretation });
	}, [
		isSingleCardInterpret,
		locale,
		onUpdate,
		positionLabels,
		reading.cards,
		reading.id,
		reading.question,
		reading.status,
	]);

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
				return isDailySpread(spreadType)
					? labels.narratorDailyShuffle
					: labels.narratorSpreadShuffle;
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
	}, [activePhase, labels, revealingIndex, spreadType]);

	const narratorMessage =
		activePhase === "question" ||
		activePhase === "setup" ||
		activePhase === "interpret-choice" ||
		activePhase === "interpret-sequential"
			? undefined
			: (summaryMessage ?? sequentialCardMessage ?? phaseNarratorMessage);

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
				return undefined;
			case "complete":
				return {
					onAdvance: backToSpreadSetup,
					label: labels.spreadNewReading,
					layout: "nav",
					showIcon: true,
					blockWhileTyping: false,
				};
			default:
				return undefined;
		}
	}, [
		activePhase,
		backToSpreadSetup,
		labels.spreadNewReading,
		labels.spreadReady,
		shuffling,
	]);

	const interpretChoiceOptions = useMemo(
		() => [
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
		[
			chooseSequentialInterpret,
			chooseSummaryInterpret,
			labels.spreadInterpretSequential,
			labels.spreadInterpretSequentialDesc,
			labels.spreadInterpretSummary,
			labels.spreadInterpretSummaryDesc,
		],
	);

	const spreadChoices = (
		<div className="spread-choices" role="group">
			<GameButton
				type="button"
				tone="light"
				layout="stack"
				fullWidth
				className="spread-choice"
				sublabel={labels.spreadSingleDesc}
				onClick={() => chooseSpread("single")}
			>
				{labels.spreadSingle}
			</GameButton>
			<GameButton
				type="button"
				tone="light"
				layout="stack"
				fullWidth
				className={`spread-choice${!GUIDED_THREE_CARD_ENABLED ? " spread-choice--locked" : ""}`}
				sublabel={
					GUIDED_THREE_CARD_ENABLED
						? labels.spreadThreeDesc
						: labels.spreadThreeLockedDesc
				}
				disabled={!GUIDED_THREE_CARD_ENABLED}
				title={
					GUIDED_THREE_CARD_ENABLED ? undefined : labels.spreadThreeLockedDesc
				}
				onClick={() => chooseSpread("three")}
			>
				{labels.spreadThree}
			</GameButton>
			<GameButton
				type="button"
				tone="light"
				layout="stack"
				fullWidth
				className="spread-choice spread-choice--locked"
				sublabel={
					GUIDED_SIX_CARD_ENABLED
						? labels.spreadSixDesc
						: labels.spreadSixLockedDesc
				}
				disabled={!GUIDED_SIX_CARD_ENABLED}
				title={GUIDED_SIX_CARD_ENABLED ? undefined : labels.spreadSixLockedDesc}
				onClick={() => chooseSpread("six")}
			>
				{labels.spreadSix}
			</GameButton>
		</div>
	);

	const showBoard =
		activePhase === "reveal" ||
		activePhase === "interpret-choice" ||
		activePhase === "interpret-sequential" ||
		activePhase === "complete";

	const currentInterpretCard =
		activePhase === "interpret-sequential"
			? reading.cards[interpretCardIndex]
			: undefined;

	return (
		<div
			className="spread-layout"
			data-spread={spreadType ?? undefined}
			data-phase={
				activePhase === "interpret-sequential"
					? "interpret"
					: activePhase === "interpret-choice"
						? "interpret-choice"
						: activePhase === "daily-reading"
							? "daily-reading"
							: activePhase === "question"
								? "question"
								: activePhase === "setup"
									? "setup"
									: undefined
			}
		>
			<AppChrome
				onSettings={onSettings}
				onBack={handleBack}
				history={
					showHistoryChrome ? (
						<HistoryButton onClick={() => setHistoryOpen(true)} />
					) : null
				}
			/>
			<GameStage scrollable>
				<div className="spread-screen">
					<div className="spread-screen__content">
						{activePhase === "setup" ? (
							<div className="guided-setup">
								<div className="guided-setup__prompt">
									<GuidedPromptBubble message={labels.narratorSpreadSetup} />
								</div>
								<div className="guided-setup__options">{spreadChoices}</div>
							</div>
						) : null}

						{activePhase === "interpret-choice" ? (
							<div className="guided-setup__prompt">
								<GuidedPromptBubble
									message={labels.narratorSpreadInterpretChoice}
								/>
							</div>
						) : null}

						{activePhase === "question" && spreadType ? (
							<GuidedClarifyFeed
								stepIds={clarifyingStepIds}
								answers={clarifyingAnswers}
								labels={labels}
								promptAction={
									showDailyDrawRandom
										? {
												label: labels.clarifyDailyDrawRandom,
												onClick: drawRandomDailyCard,
											}
										: undefined
								}
							/>
						) : null}

						{activePhase === "daily-reading" && dailyReadingCard ? (
							<ReadingPanel
								card={dailyReadingCard}
								positionLabel={labels.dailyCardLabel}
								question=""
								hideFooter
								highlightOrientation
							/>
						) : null}

						{activePhase === "shuffle" && (
							<div className="spread-phase spread-phase--center">
								<SpreadShuffle
									shuffling={shuffling}
									alt={labels.cardBackAlt}
								/>
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
								data-compact={
									activePhase === "interpret-sequential" ? "true" : undefined
								}
							>
								<div
									className="spread-board"
									data-count={reading.cards.length}
								>
									{reading.cards.map((card, index) => {
										const isFlipped =
											flippedIndices.has(index) ||
											activePhase === "complete" ||
											activePhase === "interpret-sequential";

										return (
										<TarotCard
											key={`${card.id}-${index}`}
											card={card}
											index={index}
											dealIndex={
												activePhase === "reveal" ? index : undefined
											}
											flipped={isFlipped}
											revealLoading={
												activePhase === "reveal" &&
												revealingIndex === index
											}
											sparkleOnReveal={
												activePhase === "reveal" &&
												revealingIndex === index
											}
											uprightPreview={
												reversedUprightHeld &&
												isFlipped &&
												card.reversed
											}
											onRevealReady={completeCardReveal}
											onRevealFlipComplete={completeRevealFlip}
										/>
										);
									})}
								</div>
								{activePhase === "interpret-choice" ? (
									<div className="guided-setup__options guided-setup__options--inline">
										<NarratorChoiceList options={interpretChoiceOptions} />
									</div>
								) : null}
							</div>
						)}

						{currentInterpretCard ? (
							<ReadingPanel
								card={currentInterpretCard}
								positionLabel={
									positionLabels[interpretCardIndex] ?? labels.spreadReading
								}
								question={reading.question}
								hideFooter={isSingleCardInterpret}
								onNext={
									isSingleCardInterpret
										? undefined
										: advanceSequentialInterpret
								}
								nextLabel={
									isSingleCardInterpret
										? undefined
										: interpretCardIndex >= reading.cards.length - 1
											? labels.spreadInterpretSeeSummary
											: labels.spreadInterpretNext
								}
							/>
						) : null}

						{activePhase === "complete" && spreadType !== "single" ? (
							<div className="spread-phase spread-phase--center">
								<GameButton tone="wood" onClick={backToSpreadSetup}>
									{labels.spreadNewReading}
								</GameButton>
							</div>
						) : null}
					</div>
				</div>
			</GameStage>
			{entranceReady || activePhase === "question" ? (
				<NarratorShell
					message={narratorMessage}
					input={
						activePhase === "question" && entranceReady ? (
							<ChatInput
								key={activeClarifyingStepId ?? "clarify"}
								variant="dialogue"
								onSubmit={submitClarifyingAnswer}
								placeholder={clarifyingPlaceholder}
								sendLabel={labels.sendQuestion}
								autoFocus
							/>
						) : undefined
					}
					advance={narratorAdvance}
				/>
			) : null}

			<GuidedReadingHistoryModal
				open={historyOpen}
				readings={completedReadings}
				activeReadingId={reading.id}
				onOpenChange={setHistoryOpen}
				onSelect={onSelectHistoryReading}
				onClear={onClearReadingHistory}
			/>

			{muteToast ? (
				<GameToast
					key={muteToast.id}
					message={muteToast.message}
					dismissLabel={labels.dismissToast}
					onDismiss={() => setMuteToast(null)}
				/>
			) : null}
		</div>
	);
};
