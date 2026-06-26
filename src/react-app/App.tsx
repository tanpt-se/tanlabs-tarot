import { useCallback, useMemo, useState } from "react";
import { AppLoadingOverlay } from "./components/AppLoadingOverlay";
import { NarratorAdvanceButton } from "./components/character/NarratorAdvanceButton";
import { NarratorBar } from "./components/character/NarratorBar";
import { NarratorSkipButton } from "./components/character/NarratorSkipButton";
import { SettingsModal } from "./components/settings/SettingsModal";
import { SelfViewShell } from "./components/spread/SelfViewShell";
import { SpreadScreen } from "./components/spread/SpreadScreen";
import { useGameScreen } from "./hooks/useGameScreen";
import { useReadingHistory } from "./hooks/useReadingHistory";
import { useSelfView } from "./hooks/use-self-view";
import type { NarratorAdvanceConfig } from "./lib/types/narrator-advance";
import type { Reading } from "./lib/types/reading";
import "./App.css";

const NAVIGATION_DELAY_MS = 300;

function App() {
	const { readings, beginSession, updateReading, clearHistory } =
		useReadingHistory();
	const [session, setSession] = useState<Reading>(() => beginSession());

	const {
		readingId,
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
		goToReading(reading.id);
	}, [beginSession, goToReading]);

	const [isNavigating, setIsNavigating] = useState(false);

	const handleViewReading = useCallback(
		(id: string) => {
			if (isNavigating || id === readingId) return;

			setIsNavigating(true);
			window.setTimeout(() => {
				goToReading(id);
				setIsNavigating(false);
			}, NAVIGATION_DELAY_MS);
		},
		[goToReading, isNavigating, readingId],
	);

	const [narratorMessage, setNarratorMessage] = useState<string | undefined>();
	const [narratorAdvance, setNarratorAdvance] = useState<
		NarratorAdvanceConfig | undefined
	>();
	const [narratorTyping, setNarratorTyping] = useState(false);
	const [narratorSkip, setNarratorSkip] = useState<(() => void) | null>(null);
	const handleNarratorMessageChange = useCallback((message?: string) => {
		setNarratorMessage(message);
	}, []);
	const handleNarratorAdvanceChange = useCallback(
		(config?: NarratorAdvanceConfig) => {
			setNarratorAdvance(config);
		},
		[],
	);

	const handleSelfViewBack = useCallback(() => {
		setSelfView(false);
	}, [setSelfView]);

	const completedReadings = useMemo(
		() =>
			[...readings]
				.filter((reading) => reading.status === "complete")
				.reverse(),
		[readings],
	);

	return (
		<div className="app-shell" data-self-view={selfView ? "true" : undefined}>
			<main className="app">
				{selfView ? (
					<SelfViewShell
						onSettings={openSettings}
						onExit={handleSelfViewBack}
					/>
				) : (
					<SpreadScreen
						key={readingId}
						reading={activeReading}
						completedReadings={completedReadings}
						onUpdate={updateReading}
						onBack={handleNewSession}
						onViewReading={handleViewReading}
						onSettings={openSettings}
						isNavigating={isNavigating}
						onNarratorMessageChange={handleNarratorMessageChange}
						onNarratorAdvanceChange={handleNarratorAdvanceChange}
					/>
				)}

				{isSettingsOpen && (
					<SettingsModal
						onClose={closeSettings}
						onClearHistory={() => {
							clearHistory();
							handleNewSession();
						}}
					/>
				)}
			</main>

			{isNavigating ? <AppLoadingOverlay /> : null}

			{!selfView ? (
				<div
					className="narrator-shell"
					data-active={narratorMessage ? "true" : "false"}
				>
					{narratorMessage ? (
						<NarratorBar
							message={narratorMessage}
							onTypingChange={setNarratorTyping}
							onSkipChange={setNarratorSkip}
						/>
					) : null}
					{narratorSkip ? <NarratorSkipButton onClick={narratorSkip} /> : null}
					{narratorAdvance ? (
						<NarratorAdvanceButton
							onClick={narratorAdvance.onAdvance}
							label={narratorAdvance.label}
							disabled={narratorAdvance.disabled || narratorTyping}
							layout={narratorAdvance.layout}
						/>
					) : null}
				</div>
			) : null}
		</div>
	);
}

export default App;
