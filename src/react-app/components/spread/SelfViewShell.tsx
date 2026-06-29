import { useCallback, useRef, useState } from "react";
import { useBackgroundMusic } from "../../hooks/use-background-music";
import { useAppChromeShortcuts } from "../../hooks/use-app-chrome-shortcuts";
import { useLocale } from "../../hooks/use-locale";
import { useSfx } from "../../hooks/use-sfx";
import { useSelfViewSession } from "../../hooks/use-self-view-session";
import { isAppShortcutBlocked } from "../../lib/keyboard/app-shortcut";
import { AppChrome } from "../AppChrome";
import { GameToast } from "../GameToast";
import { GameStage } from "../character/GameStage";
import { ConfirmModal } from "../modals/ConfirmModal";
import { SelfViewDeckScreen } from "./SelfViewDeckScreen";
import { SelfViewDrawBar } from "../self-view/SelfViewDrawBar";
import { HelpModal } from "../help/HelpModal";
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
		drawnCards,
		archiveAndResetLiveSpread,
		hasOverlayOpen,
		deck,
		drawOne,
	} = useSelfViewSession();
	const { playFlip, playCardDeal } = useSfx();
	const [exitModalOpen, setExitModalOpen] = useState(false);
	const [helpOpen, setHelpOpen] = useState(false);
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

	const handleHelpHotkey = useCallback(() => {
		if (helpOpen) {
			setHelpOpen(false);
			return;
		}

		if (isAppShortcutBlocked(hasOverlayOpen)) return;

		setHelpOpen(true);
	}, [hasOverlayOpen, helpOpen]);

	const handleSettingsHotkey = useCallback(() => {
		if (isSettingsOpen) {
			onCloseSettings();
			return;
		}

		if (isAppShortcutBlocked(hasOverlayOpen)) return;

		onSettings();
	}, [hasOverlayOpen, isSettingsOpen, onCloseSettings, onSettings]);

	useAppChromeShortcuts({
		onHelp: handleHelpHotkey,
		onSettings: handleSettingsHotkey,
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
					variant="minimal"
					onSettings={onSettings}
					onHelp={() => setHelpOpen(true)}
					onBack={handleBackRequest}
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

			{helpOpen ? (
				<HelpModal onClose={() => setHelpOpen(false)} />
			) : null}

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
