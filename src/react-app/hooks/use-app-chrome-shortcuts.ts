import { useEffect } from "react";
import { shouldIgnoreAppShortcut } from "../lib/keyboard/app-shortcut";

interface AppChromeShortcutHandlers {
	onHelp: () => void;
	onSettings: () => void;
	onMute: () => void;
}

export function useAppChromeShortcuts({
	onHelp,
	onSettings,
	onMute,
}: AppChromeShortcutHandlers) {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (shouldIgnoreAppShortcut(event)) return;

			const key = event.key.toLowerCase();

			if (key === "i") {
				event.preventDefault();
				onHelp();
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
	}, [onHelp, onMute, onSettings]);
}
