import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	playCardFlipSfx,
	playRevealSfx,
	playShuffleSfx,
} from "../lib/audio/sfx";
import { preloadSparkleAnimation } from "../lib/vfx/sparkle-data";
import { SfxContext } from "./sfx-context";

const SFX_STORAGE_KEY = "tarot-quest:sfx-enabled";
const VFX_STORAGE_KEY = "tarot-quest:vfx-enabled";

function readStoredEnabled(key: string, defaultValue = true): boolean {
	if (typeof localStorage === "undefined") return defaultValue;
	const stored = localStorage.getItem(key);
	return stored !== "false";
}

export function SfxProvider({ children }: { children: ReactNode }) {
	const [enabled, setEnabled] = useState(() => readStoredEnabled(SFX_STORAGE_KEY));
	const [vfxEnabled, setVfxEnabled] = useState(() => readStoredEnabled(VFX_STORAGE_KEY));

	useEffect(() => {
		if (vfxEnabled) preloadSparkleAnimation();
	}, [vfxEnabled]);

	const toggle = useCallback(() => {
		setEnabled((current) => {
			const next = !current;
			localStorage.setItem(SFX_STORAGE_KEY, String(next));
			return next;
		});
	}, []);

	const toggleVfx = useCallback(() => {
		setVfxEnabled((current) => {
			const next = !current;
			localStorage.setItem(VFX_STORAGE_KEY, String(next));
			return next;
		});
	}, []);

	const playFlip = useCallback(() => {
		if (enabled) playCardFlipSfx();
	}, [enabled]);

	const playShuffle = useCallback(() => {
		if (enabled) playShuffleSfx();
	}, [enabled]);

	const playReveal = useCallback(() => {
		if (enabled) playRevealSfx();
	}, [enabled]);

	const value = useMemo(
		() => ({
			enabled,
			vfxEnabled,
			toggle,
			toggleVfx,
			playFlip,
			playShuffle,
			playReveal,
		}),
		[enabled, vfxEnabled, toggle, toggleVfx, playFlip, playShuffle, playReveal],
	);

	return <SfxContext.Provider value={value}>{children}</SfxContext.Provider>;
}
