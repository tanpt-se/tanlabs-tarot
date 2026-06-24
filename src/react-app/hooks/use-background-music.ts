import { useContext } from "react";
import { BackgroundMusicContext } from "../providers/background-music-context";

export function useBackgroundMusic() {
	const context = useContext(BackgroundMusicContext);
	if (!context) {
		throw new Error(
			"useBackgroundMusic must be used within BackgroundMusicProvider",
		);
	}

	return context;
}
