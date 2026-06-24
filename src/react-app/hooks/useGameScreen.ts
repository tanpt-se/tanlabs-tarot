import { useCallback, useState } from "react";

export function useGameScreen(initialReadingId: string) {
	const [readingId, setReadingId] = useState(initialReadingId);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	const goToReading = useCallback((id: string) => {
		setReadingId(id);
	}, []);

	const openSettings = useCallback(() => {
		setIsSettingsOpen(true);
	}, []);

	const closeSettings = useCallback(() => {
		setIsSettingsOpen(false);
	}, []);

	return {
		readingId,
		goToReading,
		isSettingsOpen,
		openSettings,
		closeSettings,
	};
}
