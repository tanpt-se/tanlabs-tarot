import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import {
	BackgroundMusicContext,
	type BackgroundMusicContextValue,
} from "./background-music-context";

const MUSIC_SRC = "/audio/cloth-and-candlelight.mp3";
const MUSIC_STORAGE_KEY = "tarot-music-enabled";
const VOLUME_STORAGE_KEY = "tarot-music-volume";
const DEFAULT_VOLUME = 0.35;

function readStoredEnabled(): boolean {
	if (typeof localStorage === "undefined") return false;
	return localStorage.getItem(MUSIC_STORAGE_KEY) === "true";
}

function readStoredVolume(): number {
	if (typeof localStorage === "undefined") return DEFAULT_VOLUME;
	const raw = localStorage.getItem(VOLUME_STORAGE_KEY);
	if (!raw) return DEFAULT_VOLUME;
	const parsed = Number.parseFloat(raw);
	return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : DEFAULT_VOLUME;
}

export function BackgroundMusicProvider({ children }: { children: ReactNode }) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [enabled, setEnabled] = useState(readStoredEnabled);
	const [volume, setVolumeState] = useState(readStoredVolume);
	const [playing, setPlaying] = useState(false);

	const ensureAudio = useCallback(() => {
		if (audioRef.current) return audioRef.current;

		const audio = new Audio(MUSIC_SRC);
		audio.loop = true;
		audio.volume = volume;
		audio.preload = "none";

		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);
		audio.addEventListener("play", onPlay);
		audio.addEventListener("pause", onPause);

		audioRef.current = audio;
		return audio;
	}, [volume]);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = volume;
		}
	}, [volume]);

	useEffect(() => {
		localStorage.setItem(MUSIC_STORAGE_KEY, String(enabled));
		if (!enabled) {
			audioRef.current?.pause();
			return;
		}

		const audio = ensureAudio();
		void audio.play().catch(() => undefined);
	}, [enabled, ensureAudio]);

	const toggle = useCallback(() => {
		setEnabled((current) => !current);
	}, []);

	const setVolume = useCallback((next: number) => {
		const clamped = Math.min(1, Math.max(0, next));
		setVolumeState(clamped);
		localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
		if (audioRef.current) {
			audioRef.current.volume = clamped;
		}
	}, []);

	const value = useMemo<BackgroundMusicContextValue>(
		() => ({ enabled, playing, volume, toggle, setVolume }),
		[enabled, playing, volume, toggle, setVolume],
	);

	return (
		<BackgroundMusicContext.Provider value={value}>
			{children}
		</BackgroundMusicContext.Provider>
	);
}
