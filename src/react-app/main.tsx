import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SunBackdrop } from "./components/ornaments/SunBackdrop";
import { BackgroundMusicProvider } from "./providers/background-music-provider";
import { LocaleProvider } from "./providers/locale-provider";
import { SelfViewProvider } from "./providers/self-view-provider";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<LocaleProvider>
			<SelfViewProvider>
				<BackgroundMusicProvider>
					<SunBackdrop />
					<App />
				</BackgroundMusicProvider>
			</SelfViewProvider>
		</LocaleProvider>
	</StrictMode>,
);
