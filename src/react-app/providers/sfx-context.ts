import { createContext } from "react";

export interface SfxContextValue {
	enabled: boolean;
	vfxEnabled: boolean;
	toggle: () => void;
	toggleVfx: () => void;
	playFlip: () => void;
	playShuffle: () => void;
	playReveal: () => void;
}

export const SfxContext = createContext<SfxContextValue | null>(null);
