import { useCallback, useState } from "react";
import {
	clearGuidedReadingSession,
	saveGuidedReadingSession,
} from "../lib/storage/guided-reading-session-store";

export type AppScreen = "home" | "reading";

export interface UseGameScreenInitialState {
	screen?: AppScreen;
	readingId?: string;
}

export function useGameScreen(initial: UseGameScreenInitialState = {}) {
	const [screen, setScreen] = useState<AppScreen>(initial.screen ?? "home");
	const [readingId, setReadingId] = useState(initial.readingId ?? "");
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	const goHome = useCallback(() => {
		clearGuidedReadingSession();
		setScreen("home");
	}, []);

	const startReading = useCallback((id?: string) => {
		if (id) {
			setReadingId(id);
			saveGuidedReadingSession(id);
		}
		setScreen("reading");
	}, []);

	const goToReading = useCallback((id: string) => {
		setReadingId(id);
		setScreen("reading");
	}, []);

	const openSettings = useCallback(() => {
		setIsSettingsOpen(true);
	}, []);

	const closeSettings = useCallback(() => {
		setIsSettingsOpen(false);
	}, []);

	return {
		screen,
		readingId,
		goHome,
		startReading,
		goToReading,
		isSettingsOpen,
		openSettings,
		closeSettings,
	};
};
