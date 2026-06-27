import { useCallback, useState } from "react";
import { useBackgroundMusic } from "../../hooks/use-background-music";
import { useAppChromeShortcuts } from "../../hooks/use-app-chrome-shortcuts";
import { useLocale } from "../../hooks/use-locale";
import { SelfViewSessionProvider } from "../../providers/self-view-session-provider";
import { useSelfViewSession } from "../../hooks/use-self-view-session";
import {
	isAppShortcutBlocked,
} from "../../lib/keyboard/app-shortcut";
import { AppChrome } from "../AppChrome";
import { GameToast } from "../GameToast";
import { GameStage } from "../character/GameStage";
import { ConfirmModal } from "../modals/ConfirmModal";
import { SelfViewDeckScreen } from "./SelfViewDeckScreen";
import { HelpModal } from "../help/HelpModal";

interface SelfViewShellProps {
	onSettings: () => void;
	isSettingsOpen: boolean;
	onCloseSettings: () => void;
	onExit: () => void;
}

function SelfViewShellContent({
	onSettings,
	isSettingsOpen,
	onCloseSettings,
	onExit,
}: SelfViewShellProps) {
	const { labels } = useLocale();
	const { enabled, toggle: toggleMusic } = useBackgroundMusic();
	const { drawnCards, archiveCurrentSpread, hasOverlayOpen } = useSelfViewSession();
	const [exitModalOpen, setExitModalOpen] = useState(false);
	const [helpOpen, setHelpOpen] = useState(false);
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
		archiveCurrentSpread();
		setExitModalOpen(false);
		onExit();
	}, [archiveCurrentSpread, onExit]);

	return (
		<>
			<AppChrome
				variant="minimal"
				onSettings={onSettings}
				onHelp={() => setHelpOpen(true)}
				onBack={handleBackRequest}
			/>
			<GameStage layout="full">
				<SelfViewDeckScreen />
			</GameStage>

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

export function SelfViewShell({
	onSettings,
	isSettingsOpen,
	onCloseSettings,
	onExit,
}: SelfViewShellProps) {
	return (
		<SelfViewSessionProvider>
			<SelfViewShellContent
				onSettings={onSettings}
				isSettingsOpen={isSettingsOpen}
				onCloseSettings={onCloseSettings}
				onExit={onExit}
			/>
		</SelfViewSessionProvider>
	);
}
