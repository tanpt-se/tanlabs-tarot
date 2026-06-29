import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AppLoadingOverlay } from "./components/AppLoadingOverlay";
import { HomeTableBackdrop } from "./components/home/HomeTableBackdrop";
import { HomeScreen } from "./components/home/HomeScreen";
import { SettingsModal } from "./components/settings/SettingsModal";
import { SelfViewShell } from "./components/spread/SelfViewShell";
import { SpreadScreen } from "./components/spread/SpreadScreen";
import { useGameScreen } from "./hooks/use-game-screen";
import { useReadingHistory } from "./hooks/use-reading-history";
import { useSelfView } from "./hooks/use-self-view";
import { GUIDED_READING_ENABLED } from "./lib/features/guided-reading";
import { ScreenTransition } from "./components/motion/screen-motion";
import { SelfViewSessionProvider } from "./providers/self-view-session-provider";
import type { Reading } from "./lib/types/reading";
import "./App.css";

const NAVIGATION_DELAY_MS = 300;

function App() {
	const { readings, beginSession, updateReading } = useReadingHistory();
	const [session, setSession] = useState<Reading>(() => beginSession());

	const {
		screen,
		readingId,
		goHome,
		startReading,
		goToReading,
		isSettingsOpen,
		openSettings,
		closeSettings,
	} = useGameScreen(session.id);

	const { enabled: selfView, setEnabled: setSelfView } = useSelfView();

	const activeReading =
		readings.find((reading) => reading.id === readingId) ?? session;

	const handleNewSession = useCallback(() => {
		const reading = beginSession();
		setSession(reading);
		return reading;
	}, [beginSession]);

	const handleStartGuidedReading = useCallback(() => {
		if (!GUIDED_READING_ENABLED) return;

		const reading = handleNewSession();
		startReading(reading.id);
	}, [handleNewSession, startReading]);

	const handleStartSelfView = useCallback(() => {
		setSelfView(true);
	}, [setSelfView]);

	const [isNavigating, setIsNavigating] = useState(false);

	const handleViewReading = useCallback(
		(id: string) => {
			if (!GUIDED_READING_ENABLED) return;
			if (isNavigating || id === readingId) return;

			setIsNavigating(true);
			window.setTimeout(() => {
				goToReading(id);
				setIsNavigating(false);
			}, NAVIGATION_DELAY_MS);
		},
		[goToReading, isNavigating, readingId],
	);

	const handleSelfViewBack = useCallback(() => {
		setSelfView(false);
		goHome();
	}, [goHome, setSelfView]);

	const handleGoHome = useCallback(() => {
		goHome();
	}, [goHome]);

	const completedReadings = useMemo(
		() =>
			[...readings]
				.filter((reading) => reading.status === "complete")
				.reverse(),
		[readings],
	);

	return (
		<SelfViewSessionProvider>
			<div
				className="app-shell"
				data-self-view={selfView ? "true" : undefined}
				data-screen={selfView ? "self-view" : screen}
			>
				<HomeTableBackdrop />

				<main className="app">
					<AnimatePresence mode="wait">
						{selfView ? (
							<ScreenTransition
								key="self-view"
								variant="self-view"
								className="app-screen"
							>
								<SelfViewShell
									onSettings={openSettings}
									isSettingsOpen={isSettingsOpen}
									onCloseSettings={closeSettings}
									onExit={handleSelfViewBack}
								/>
							</ScreenTransition>
						) : screen === "home" ? (
							<ScreenTransition key="home" variant="home" className="app-screen">
								<HomeScreen
									onSelfView={handleStartSelfView}
									onGuidedReading={handleStartGuidedReading}
									onOpenSettings={openSettings}
									onCloseSettings={closeSettings}
									isSettingsOpen={isSettingsOpen}
								/>
							</ScreenTransition>
						) : GUIDED_READING_ENABLED ? (
							<ScreenTransition key={`reading-${readingId}`} className="app-screen">
								<SpreadScreen
									reading={activeReading}
									completedReadings={completedReadings}
									onUpdate={updateReading}
									onBack={handleGoHome}
									onGoHome={handleGoHome}
									onViewReading={handleViewReading}
									onSettings={openSettings}
									isNavigating={isNavigating}
								/>
							</ScreenTransition>
						) : (
							<ScreenTransition key="home-fallback" variant="home" className="app-screen">
								<HomeScreen
									onSelfView={handleStartSelfView}
									onGuidedReading={handleStartGuidedReading}
									onOpenSettings={openSettings}
									onCloseSettings={closeSettings}
									isSettingsOpen={isSettingsOpen}
								/>
							</ScreenTransition>
						)}
					</AnimatePresence>

					{isSettingsOpen ? (
					<SettingsModal key="settings-modal" onClose={closeSettings} />
				) : null}
				</main>

				{isNavigating ? <AppLoadingOverlay /> : null}
			</div>
		</SelfViewSessionProvider>
	);
}

export default App;
