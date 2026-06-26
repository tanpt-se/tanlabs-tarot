import { useCallback, useEffect, useRef, useState } from "react";

interface UseTypewriterTextOptions {
	speedMs?: number;
	startDelayMs?: number;
	/** Skip animation — for long text or complete-phase summaries */
	instant?: boolean;
}

const INSTANT_CHAR_THRESHOLD = 120;
const CHARS_PER_STEP = 3;

function getReducedMotion(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useTypewriterText(
	text: string,
	{ speedMs = 22, startDelayMs = 80, instant = false }: UseTypewriterTextOptions = {},
) {
	const [displayed, setDisplayed] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const cancelledRef = useRef(false);

	const skip = useCallback(() => {
		cancelledRef.current = true;
		setDisplayed(text);
		setIsTyping(false);
	}, [text]);

	const useInstant =
		instant || getReducedMotion() || text.length > INSTANT_CHAR_THRESHOLD;

	useEffect(() => {
		if (useInstant) {
			setDisplayed(text);
			setIsTyping(false);
			return;
		}

		cancelledRef.current = false;

		let index = 0;
		let rafId = 0;
		let startTimeoutId = 0;
		let lastTick = 0;

		const stop = () => {
			cancelledRef.current = true;
			window.clearTimeout(startTimeoutId);
			window.cancelAnimationFrame(rafId);
			setIsTyping(false);
		};

		startTimeoutId = window.setTimeout(() => {
			if (cancelledRef.current) return;

			setDisplayed("");
			setIsTyping(text.length > 0);
			lastTick = performance.now();

			const tick = (now: number) => {
				if (cancelledRef.current) return;

				if (now - lastTick >= speedMs) {
					const elapsedSteps = Math.max(
						1,
						Math.floor((now - lastTick) / speedMs),
					);
					const step =
						CHARS_PER_STEP *
						(1 + Math.floor(index / 48)) *
						elapsedSteps;
					index = Math.min(text.length, index + step);
					setDisplayed(text.slice(0, index));
					lastTick = now;
				}

				if (index < text.length) {
					rafId = window.requestAnimationFrame(tick);
				} else {
					setIsTyping(false);
				}
			};

			if (text.length > 0) {
				rafId = window.requestAnimationFrame(tick);
			}
		}, startDelayMs);

		return stop;
	}, [text, speedMs, startDelayMs, useInstant]);

	if (useInstant) {
		return { displayed: text, isTyping: false, skip };
	}

	return { displayed, isTyping, skip };
}
