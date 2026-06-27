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
	setSfxVolumeMultiplier,
} from "../lib/audio/sfx";
import { preloadSparkleAnimation } from "../lib/vfx/sparkle-data";
import { SfxContext } from "./sfx-context";

const SFX_STORAGE_KEY = "tarot-quest:sfx-enabled";
const VFX_STORAGE_KEY = "tarot-quest:vfx-enabled";
const SFX_VOLUME_STORAGE_KEY = "tarot-quest:sfx-volume";
const DEFAULT_SFX_VOLUME = 0.8;

function readStoredEnabled(key: string, defaultValue = true): boolean {
	if (typeof localStorage === "undefined") return defaultValue;
	const stored = localStorage.getItem(key);
	return stored !== "false";
}

function readStoredVolume(): number {
	if (typeof localStorage === "undefined") return DEFAULT_SFX_VOLUME;
	const raw = localStorage.getItem(SFX_VOLUME_STORAGE_KEY);
	if (!raw) return DEFAULT_SFX_VOLUME;
	const parsed = Number.parseFloat(raw);
	return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : DEFAULT_SFX_VOLUME;
}

export function SfxProvider({ children }: { children: ReactNode }) {
	const [enabled, setEnabled] = useState(() => readStoredEnabled(SFX_STORAGE_KEY));
	const [vfxEnabled, setVfxEnabled] = useState(() => readStoredEnabled(VFX_STORAGE_KEY));
	const [volume, setVolumeState] = useState(readStoredVolume);

	useEffect(() => {
		setSfxVolumeMultiplier(volume);
	}, [volume]);

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

	const toggleEffects = useCallback(() => {
		const next = !(enabled && vfxEnabled);
		setEnabled(next);
		setVfxEnabled(next);
		localStorage.setItem(SFX_STORAGE_KEY, String(next));
		localStorage.setItem(VFX_STORAGE_KEY, String(next));
	}, [enabled, vfxEnabled]);

	const setVolume = useCallback((next: number) => {
		const clamped = Math.min(1, Math.max(0, next));
		setVolumeState(clamped);
		localStorage.setItem(SFX_VOLUME_STORAGE_KEY, String(clamped));
		setSfxVolumeMultiplier(clamped);
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
			volume,
			toggle,
			toggleVfx,
			toggleEffects,
			setVolume,
			playFlip,
			playShuffle,
			playReveal,
		}),
		[
			enabled,
			vfxEnabled,
			volume,
			toggle,
			toggleVfx,
			toggleEffects,
			setVolume,
			playFlip,
			playShuffle,
			playReveal,
		],
	);

	return <SfxContext.Provider value={value}>{children}</SfxContext.Provider>;
}
