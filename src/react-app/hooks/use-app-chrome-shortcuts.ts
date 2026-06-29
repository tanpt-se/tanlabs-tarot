import { useEffect } from "react";
import { shouldIgnoreAppShortcut } from "../lib/keyboard/app-shortcut";

interface AppChromeShortcutHandlers {
	onHelp?: () => void;
	onHistory?: () => void;
	onSettings: () => void;
	onMute: () => void;
}

export function useAppChromeShortcuts({
	onHelp,
	onHistory,
	onSettings,
	onMute,
}: AppChromeShortcutHandlers) {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (shouldIgnoreAppShortcut(event)) return;

			const key = event.key.toLowerCase();

			if (key === "i" && onHelp) {
				event.preventDefault();
				onHelp();
				return;
			}

			if (key === "h" && onHistory) {
				event.preventDefault();
				onHistory();
				return;
			}

			if (key === "o") {
				event.preventDefault();
				onSettings();
				return;
			}

			if (key === "m") {
				event.preventDefault();
				onMute();
			}
		};

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [onHelp, onHistory, onMute, onSettings]);
}
