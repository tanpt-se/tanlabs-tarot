import type { ReactNode } from "react";
import { BackButton } from "./BackButton";
import { HelpButton } from "./HelpButton";
import { SettingsButton } from "./SettingsButton";

interface AppChromeProps {
	onSettings: () => void;
	onHelp?: () => void;
	onBack?: () => void;
	history?: ReactNode;
}

export function AppChrome({ onSettings, onHelp, onBack, history }: AppChromeProps) {
	return (
		<header className="app-chrome" data-variant="minimal">
			<div className="app-chrome__start">
				{onBack ? <BackButton onClick={onBack} /> : null}
			</div>
			<span className="app-chrome__grow" aria-hidden />
			<div className="app-chrome__actions">
				{onHelp ? <HelpButton onClick={onHelp} /> : null}
				{history}
				<SettingsButton onClick={onSettings} />
			</div>
		</header>
	);
}
