import { useCallback, useRef, useState } from "react";
import { useBackgroundMusic } from "../../hooks/use-background-music";
import { useAppChromeShortcuts } from "../../hooks/use-app-chrome-shortcuts";
import { useLocale } from "../../hooks/use-locale";
import { useSfx } from "../../hooks/use-sfx";
import { useSelfViewSession } from "../../hooks/use-self-view-session";
import { isAppShortcutBlocked } from "../../lib/keyboard/app-shortcut";
import { AppChrome } from "../AppChrome";
import { HistoryButton } from "../HistoryButton";
import { GameToast } from "../GameToast";
import { GameStage } from "../character/GameStage";
import { ConfirmModal } from "../modals/ConfirmModal";
import { SelfViewDeckScreen } from "./SelfViewDeckScreen";
import { SelfViewDrawBar } from "../self-view/SelfViewDrawBar";
import { SelfViewHistoryModal } from "../self-view/SelfViewHistoryModal";
import { SELF_VIEW_MAX_SPREAD_CARDS } from "../../lib/self-view/spread-layout";
import { preloadTopOfDeck } from "../../lib/tarot/card-image";

interface SelfViewShellProps {
	onSettings: () => void;
	isSettingsOpen: boolean;
	onCloseSettings: () => void;
	onExit: () => void;
}

export function SelfViewShell({
	onSettings,
	isSettingsOpen,
	onCloseSettings,
	onExit,
}: SelfViewShellProps) {
	const { labels } = useLocale();
	const { enabled, toggle: toggleMusic } = useBackgroundMusic();
	const {
		sessions,
		drawnCards,
		archiveAndResetLiveSpread,
		hasOverlayOpen,
		deck,
		drawOne,
	} = useSelfViewSession();
	const { playFlip, playCardDeal } = useSfx();
	const [exitModalOpen, setExitModalOpen] = useState(false);
	const [historyOpen, setHistoryOpen] = useState(false);
	const dealOriginRef = useRef<HTMLButtonElement>(null);
	const [muteToast, setMuteToast] = useState<{
		id: number;
		message: string;
	} | null>(null);

	const handleMuteHotkey = useCallback(() => {
		setMuteToast({
			id: Date.now(),
			message: enabled ? labels.musicMutedToast : labels.musicUnmutedToast,
		});
		toggleMusic();
	}, [enabled, labels.musicMutedToast, labels.musicUnmutedToast, toggleMusic]);

	const handleSettingsHotkey = useCallback(() => {
		if (isSettingsOpen) {
			onCloseSettings();
			return;
		}

		if (isAppShortcutBlocked(hasOverlayOpen)) return;

		onSettings();
	}, [hasOverlayOpen, isSettingsOpen, onCloseSettings, onSettings]);

	const handleHistoryHotkey = useCallback(() => {
		if (sessions.length === 0) return;

		if (historyOpen) {
			setHistoryOpen(false);
			return;
		}

		if (isAppShortcutBlocked(hasOverlayOpen)) return;

		setHistoryOpen(true);
	}, [hasOverlayOpen, historyOpen, sessions.length]);

	useAppChromeShortcuts({
		onSettings: handleSettingsHotkey,
		onHistory: sessions.length > 0 ? handleHistoryHotkey : undefined,
		onMute: handleMuteHotkey,
	});

	const handleBackRequest = useCallback(() => {
		if (drawnCards.length > 0) {
			setExitModalOpen(true);
			return;
		}

		onExit();
	}, [drawnCards.length, onExit]);

	const handleExitCancel = useCallback(() => {
		setExitModalOpen(false);
	}, []);

	const handleExitConfirm = useCallback(() => {
		archiveAndResetLiveSpread();
		setExitModalOpen(false);
		onExit();
	}, [archiveAndResetLiveSpread, onExit]);

	const warmNextDraw = useCallback(() => {
		preloadTopOfDeck(deck);
	}, [deck]);

	const handleDraw = useCallback(() => {
		warmNextDraw();
		drawOne();
		playCardDeal();
		playFlip();
	}, [drawOne, playCardDeal, playFlip, warmNextDraw]);

	const drawDisabled =
		deck.length === 0 ||
		drawnCards.length >= SELF_VIEW_MAX_SPREAD_CARDS;

	return (
		<>
			<div className="self-view-shell">
				<AppChrome
					onSettings={onSettings}
					onBack={handleBackRequest}
					history={
						sessions.length > 0 ? (
							<HistoryButton onClick={() => setHistoryOpen(true)} />
						) : null
					}
				/>
				<GameStage layout="full">
					<SelfViewDeckScreen />
				</GameStage>
				<SelfViewDrawBar
					drawDisabled={drawDisabled}
					onDraw={handleDraw}
					onWarmDraw={warmNextDraw}
					dealOriginRef={dealOriginRef}
				/>
			</div>

			<SelfViewHistoryModal
				open={historyOpen}
				onOpenChange={setHistoryOpen}
			/>

			{exitModalOpen ? (
				<ConfirmModal
					title={labels.selfViewExitTitle}
					message={labels.selfViewExitMessage}
					confirmLabel={labels.selfViewExitConfirm}
					cancelLabel={labels.selfViewExitCancel}
					onConfirm={handleExitConfirm}
					onCancel={handleExitCancel}
				/>
			) : null}

			{muteToast ? (
				<GameToast
					key={muteToast.id}
					message={muteToast.message}
					dismissLabel={labels.dismissToast}
					onDismiss={() => setMuteToast(null)}
				/>
			) : null}
		</>
	);
}
