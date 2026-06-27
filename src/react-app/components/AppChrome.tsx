import { useLocale } from "../hooks/use-locale";
import { BackButton } from "./BackButton";
import { QuestionBar } from "./QuestionBar";
import { SelfViewModeButton } from "./SelfViewModeButton";
import { SelfViewTopActions } from "./SelfViewTopActions";
import { HelpButton } from "./HelpButton";
import { SettingsButton } from "./SettingsButton";

interface AppChromeProps {
	onSettings: () => void;
	onHelp?: () => void;
	onBack?: () => void;
	question?: string;
	variant?: "default" | "minimal";
}

export function AppChrome({
	onSettings,
	onHelp,
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
			</div>
			{variant === "minimal" ? (
				<SelfViewTopActions />
			) : showQuestion ? (
				<QuestionBar
					label={labels.spreadYourQuestion}
					question={question!}
				/>
			) : (
				<span className="app-chrome__grow" aria-hidden />
			)}
			<div className="app-chrome__actions">
				<SelfViewModeButton />
				{onHelp ? <HelpButton onClick={onHelp} /> : null}
				<SettingsButton onClick={onSettings} />
			</div>
		</header>
	);
}
