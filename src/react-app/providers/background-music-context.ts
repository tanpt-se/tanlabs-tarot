import { createContext } from "react";

export type BackgroundMusicContextValue = {
	enabled: boolean;
	playing: boolean;
	volume: number;
	toggle: () => void;
	setVolume: (volume: number) => void;
};

export const BackgroundMusicContext =
	createContext<BackgroundMusicContextValue | null>(null);
