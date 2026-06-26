import { useCallback, useEffect, useRef, useState } from "react";

interface UseTypewriterTextOptions {
	speedMs?: number;
	startDelayMs?: number;
}

function getReducedMotion(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useTypewriterText(
	text: string,
	{ speedMs = 26, startDelayMs = 120 }: UseTypewriterTextOptions = {},
) {
	const [displayed, setDisplayed] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const cancelledRef = useRef(false);

	const skip = useCallback(() => {
		cancelledRef.current = true;
		setDisplayed(text);
		setIsTyping(false);
	}, [text]);

	useEffect(() => {
		if (getReducedMotion()) return;

		cancelledRef.current = false;

		let index = 0;
		let rafId = 0;
		let startTimeoutId = 0;
		let lastTick = 0;

		const stop = () => {
			cancelledRef.current = true;
			window.clearTimeout(startTimeoutId);
			window.cancelAnimationFrame(rafId);
		};

		startTimeoutId = window.setTimeout(() => {
			if (cancelledRef.current) return;

			setDisplayed("");
			setIsTyping(text.length > 0);
			lastTick = performance.now();

			const tick = (now: number) => {
				if (cancelledRef.current) return;

				if (now - lastTick >= speedMs) {
					index += 1;
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
	}, [text, speedMs, startDelayMs]);

	if (getReducedMotion()) {
		return { displayed: text, isTyping: false, skip };
	}

	return { displayed, isTyping, skip };
}
