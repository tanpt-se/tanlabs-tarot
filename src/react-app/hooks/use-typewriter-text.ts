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
		const timeoutIds: number[] = [];

		const schedule = (callback: () => void, delay: number) => {
			const id = window.setTimeout(() => {
				if (!cancelledRef.current) callback();
			}, delay);
			timeoutIds.push(id);
		};

		schedule(() => {
			if (cancelledRef.current) return;

			setDisplayed("");
			setIsTyping(text.length > 0);

			const typeNext = () => {
				if (cancelledRef.current) return;

				index += 1;
				setDisplayed(text.slice(0, index));

				if (index < text.length) {
					schedule(typeNext, speedMs);
				} else {
					setIsTyping(false);
				}
			};

			if (text.length > 0) {
				typeNext();
			}
		}, startDelayMs);

		return () => {
			cancelledRef.current = true;
			for (const id of timeoutIds) {
				window.clearTimeout(id);
			}
		};
	}, [text, speedMs, startDelayMs]);

	if (getReducedMotion()) {
		return { displayed: text, isTyping: false, skip };
	}

	return { displayed, isTyping, skip };
}
