import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BackgroundMusicProvider } from "./providers/background-music-provider";
import { LocaleProvider } from "./providers/locale-provider";
import { ReversedUprightHoldProvider } from "./providers/reversed-upright-hold-provider";
import { SelfViewProvider } from "./providers/self-view-provider";
import { SfxProvider } from "./providers/sfx-provider";
import "./index.css";
import App from "./App.tsx";

function AppRoot() {
	return (
		<LocaleProvider>
			<SelfViewProvider>
				<ReversedUprightHoldProvider>
					<SfxProvider>
						<BackgroundMusicProvider>
							<App />
						</BackgroundMusicProvider>
					</SfxProvider>
				</ReversedUprightHoldProvider>
			</SelfViewProvider>
		</LocaleProvider>
	);
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AppRoot />
	</StrictMode>,
);
