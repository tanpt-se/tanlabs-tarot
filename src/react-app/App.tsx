import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import { AnimatePresence } from "framer-motion";
import { HomeTableBackdrop } from "./components/home/HomeTableBackdrop";
import { HomeScreen } from "./components/home/HomeScreen";
import { SettingsModal } from "./components/settings/SettingsModal";
import { SelfViewShell } from "./components/spread/SelfViewShell";
import { SpreadScreen } from "./components/spread/SpreadScreen";
import { useGameScreen, type AppScreen } from "./hooks/use-game-screen";
import { useReadingHistory } from "./hooks/use-reading-history";
import { useSelfView } from "./hooks/use-self-view";
import { GUIDED_READING_ENABLED } from "./lib/features/guided-reading";
import { resolveGuidedReadingRestore } from "./lib/storage/guided-reading-session-store";
import { ScreenTransition } from "./components/motion/screen-motion";
import { SelfViewSessionProvider } from "./providers/self-view-session-provider";
import type { Reading } from "./lib/types/reading";
import "./App.css";

function resolveInitialGuidedState(readings: Reading[]): {
	screen: AppScreen;
	readingId: string;
} {
	if (!GUIDED_READING_ENABLED) {
		return { screen: "home", readingId: "" };
	}

	const restored = resolveGuidedReadingRestore(readings);
	if (!restored) {
		return { screen: "home", readingId: "" };
	}

	return { screen: "reading", readingId: restored.readingId };
}

function App() {
	const { readings, beginSession, updateReading, clearHistory } = useReadingHistory();
	const initialGuided = useMemo(
		() => resolveInitialGuidedState(readings),
		// eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap from first persisted load only
		[],
	);

	const {
		screen,
		readingId,
		goHome,
		startReading,
		isSettingsOpen,
		openSettings,
		closeSettings,
	} = useGameScreen(initialGuided);

	const { enabled: selfView, setEnabled: setSelfView } = useSelfView();

	const activeReading = readings.find((reading) => reading.id === readingId);
	const completedReadings = useMemo(
		() => readings.filter((reading) => reading.status === "complete"),
		[readings],
	);

	const handleNewSession = useCallback(() => beginSession(), [beginSession]);

	const handleStartGuidedReading = useCallback(() => {
		if (!GUIDED_READING_ENABLED) return;

		const reading = handleNewSession();
		startTransition(() => {
			startReading(reading.id);
		});
	}, [handleNewSession, startReading]);

	const handleSelectHistoryReading = useCallback(
		(id: string) => {
			startReading(id);
		},
		[startReading],
	);

	const handleStartSelfView = useCallback(() => {
		setSelfView(true);
	}, [setSelfView]);

	const [readingEntranceReady, setReadingEntranceReady] = useState(
		() => initialGuided.screen === "reading",
	);
	const skipEntranceDelayRef = useRef(initialGuided.screen === "reading");

	useEffect(() => {
		if (screen !== "reading") {
			setReadingEntranceReady(false);
			return;
		}

		if (skipEntranceDelayRef.current) {
			skipEntranceDelayRef.current = false;
			setReadingEntranceReady(true);
			return;
		}

		setReadingEntranceReady(false);
		const fallback = window.setTimeout(() => {
			setReadingEntranceReady(true);
		}, 480);

		return () => {
			window.clearTimeout(fallback);
		};
	}, [screen, readingId]);

	useEffect(() => {
		if (screen === "reading" && !activeReading) {
			goHome();
		}
	}, [activeReading, goHome, screen]);

	const handleSelfViewBack = useCallback(() => {
		setSelfView(false);
		goHome();
	}, [goHome, setSelfView]);

	const handleGoHome = useCallback(() => {
		goHome();
	}, [goHome]);

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
						) : activeReading ? (
							<ScreenTransition
								key={`reading-${readingId}`}
								variant="self-view"
								className="app-screen"
								onEntered={() => setReadingEntranceReady(true)}
							>
								<SpreadScreen
									reading={activeReading}
									completedReadings={completedReadings}
									onUpdate={updateReading}
									onBack={handleGoHome}
									onSelectHistoryReading={handleSelectHistoryReading}
									onClearReadingHistory={clearHistory}
									onSettings={openSettings}
									isSettingsOpen={isSettingsOpen}
									onCloseSettings={closeSettings}
									entranceReady={readingEntranceReady}
								/>
							</ScreenTransition>
						) : null}
					</AnimatePresence>

					{isSettingsOpen ? (
					<SettingsModal key="settings-modal" onClose={closeSettings} />
				) : null}
				</main>
			</div>
		</SelfViewSessionProvider>
	);
}

export default App;
