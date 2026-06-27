let audioContext: AudioContext | null = null;
let sfxVolumeMultiplier = 1;

export function setSfxVolumeMultiplier(volume: number): void {
	sfxVolumeMultiplier = Math.min(1, Math.max(0, volume));
}

function getAudioContext(): AudioContext | null {
	if (typeof window === "undefined") return null;
	if (!audioContext) {
		audioContext = new AudioContext();
	}
	return audioContext;
}

function playTone(
	frequency: number,
	duration: number,
	type: OscillatorType = "sine",
	volume = 0.08,
): void {
	const ctx = getAudioContext();
	if (!ctx) return;

	if (ctx.state === "suspended") {
		void ctx.resume();
	}

	const oscillator = ctx.createOscillator();
	const gain = ctx.createGain();

	oscillator.type = type;
	oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

	gain.gain.setValueAtTime(volume * sfxVolumeMultiplier, ctx.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

	oscillator.connect(gain);
	gain.connect(ctx.destination);

	oscillator.start(ctx.currentTime);
	oscillator.stop(ctx.currentTime + duration);
}

export function playCardFlipSfx(): void {
	playTone(520, 0.12, "sine", 0.06);
	window.setTimeout(() => playTone(780, 0.1, "sine", 0.05), 60);
}

export function playShuffleSfx(): void {
	for (let i = 0; i < 5; i++) {
		window.setTimeout(() => {
			playTone(180 + Math.random() * 80, 0.04, "triangle", 0.04);
		}, i * 70);
	}
}

export function playRevealSfx(): void {
	playTone(440, 0.15, "sine", 0.05);
	window.setTimeout(() => playTone(660, 0.2, "sine", 0.04), 100);
	window.setTimeout(() => playTone(880, 0.25, "sine", 0.03), 200);
}
