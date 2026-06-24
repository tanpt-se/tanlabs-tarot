import { useLocale } from "../hooks/use-locale";
import { BackButton } from "./BackButton";
import { QuestionBar } from "./QuestionBar";
import { SelfViewHistoryButton } from "./SelfViewHistoryButton";
import { SelfViewModeButton } from "./SelfViewModeButton";
import { SettingsButton } from "./SettingsButton";

interface AppChromeProps {
	onSettings: () => void;
	onBack?: () => void;
	question?: string;
	variant?: "default" | "minimal";
}

export function AppChrome({
	onSettings,
	onBack,
	question,
	variant = "default",
}: AppChromeProps) {
	const { labels } = useLocale();
	const showQuestion = variant === "default" && Boolean(question?.trim());

	return (
		<header className="app-chrome" data-variant={variant}>
			<div className="app-chrome__start">
				{onBack ? <BackButton onClick={onBack} /> : null}
				{variant === "minimal" ? <SelfViewHistoryButton /> : null}
			</div>
			{showQuestion ? (
				<QuestionBar
					label={labels.spreadYourQuestion}
					question={question!}
				/>
			) : (
				<span className="app-chrome__grow" aria-hidden />
			)}
			<div className="app-chrome__actions">
				<SelfViewModeButton />
				<SettingsButton onClick={onSettings} />
			</div>
		</header>
	);
}
