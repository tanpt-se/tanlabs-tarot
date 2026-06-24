import { useCallback, useState } from "react";
import { useLocale } from "../../hooks/use-locale";
import { SelfViewSessionProvider } from "../../providers/self-view-session-context";
import { useSelfViewSession } from "../../hooks/useSelfViewSession";
import { AppChrome } from "../AppChrome";
import { GameStage } from "../character/GameStage";
import { SelfViewConfirmModal } from "./SelfViewConfirmModal";
import { SelfViewDeckScreen } from "./SelfViewDeckScreen";

interface SelfViewShellProps {
	onSettings: () => void;
	onExit: () => void;
}

function SelfViewShellContent({ onSettings, onExit }: SelfViewShellProps) {
	const { labels } = useLocale();
	const { drawnCards, archiveCurrentSpread } = useSelfViewSession();
	const [exitModalOpen, setExitModalOpen] = useState(false);

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
				onBack={handleBackRequest}
			/>
			<GameStage layout="full">
				<SelfViewDeckScreen />
			</GameStage>

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
		</>
	);
}

export function SelfViewShell({ onSettings, onExit }: SelfViewShellProps) {
	return (
		<SelfViewSessionProvider>
			<SelfViewShellContent onSettings={onSettings} onExit={onExit} />
		</SelfViewSessionProvider>
	);
}
