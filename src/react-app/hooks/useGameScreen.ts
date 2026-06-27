import { useCallback, useState } from "react";

export type AppScreen = "home" | "reading";

export function useGameScreen(initialReadingId: string) {
	const [screen, setScreen] = useState<AppScreen>("home");
	const [readingId, setReadingId] = useState(initialReadingId);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	const goHome = useCallback(() => {
		setScreen("home");
	}, []);

	const startReading = useCallback((id?: string) => {
		if (id) setReadingId(id);
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
