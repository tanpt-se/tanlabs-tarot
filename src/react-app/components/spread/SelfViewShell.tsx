import { useCallback, useEffect, useState } from "react";
import { useBackgroundMusic } from "../../hooks/use-background-music";
import { useLocale } from "../../hooks/use-locale";
import { SelfViewSessionProvider } from "../../providers/self-view-session-context";
import { useSelfViewSession } from "../../hooks/useSelfViewSession";
import {
	isSelfViewShortcutBlocked,
	shouldIgnoreSelfViewShortcut,
} from "../../lib/keyboard/should-ignore-shortcut";
import { AppChrome } from "../AppChrome";
import { GameToast } from "../GameToast";
import { GameStage } from "../character/GameStage";
import { SelfViewConfirmModal } from "./SelfViewConfirmModal";
import { SelfViewDeckScreen } from "./SelfViewDeckScreen";
import { SelfViewHelpModal } from "./SelfViewHelpModal";

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

		if (isSelfViewShortcutBlocked(hasOverlayOpen)) return;

		setHelpOpen(true);
	}, [hasOverlayOpen, helpOpen]);

	const handleSettingsHotkey = useCallback(() => {
		if (isSettingsOpen) {
			onCloseSettings();
			return;
		}

		if (isSelfViewShortcutBlocked(hasOverlayOpen)) return;

		onSettings();
	}, [hasOverlayOpen, isSettingsOpen, onCloseSettings, onSettings]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (shouldIgnoreSelfViewShortcut(event)) return;

			const key = event.key.toLowerCase();

			if (key === "i") {
				event.preventDefault();
				handleHelpHotkey();
				return;
			}

			if (key === "o") {
				event.preventDefault();
				handleSettingsHotkey();
				return;
			}

			if (key === "m") {
				event.preventDefault();
				handleMuteHotkey();
			}
		};

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [handleHelpHotkey, handleMuteHotkey, handleSettingsHotkey]);

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
				<SelfViewHelpModal onClose={() => setHelpOpen(false)} />
			) : null}

			{exitModalOpen ? (
				<SelfViewConfirmModal
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
