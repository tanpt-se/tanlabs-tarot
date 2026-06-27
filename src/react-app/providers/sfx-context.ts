import { createContext } from "react";

export interface SfxContextValue {
	enabled: boolean;
	vfxEnabled: boolean;
	volume: number;
	toggle: () => void;
	toggleVfx: () => void;
	toggleEffects: () => void;
	setVolume: (volume: number) => void;
	playFlip: () => void;
	playShuffle: () => void;
	playReveal: () => void;
}

export const SfxContext = createContext<SfxContextValue | null>(null);
