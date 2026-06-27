import { useCallback, useEffect, useRef, useState } from "react";
import type { Reading } from "../lib/types/reading";
import {
	createReading,
	loadReadingHistory,
	saveReadingHistory,
} from "../lib/storage/reading-store";

const PERSIST_DEBOUNCE_MS = 250;

export function useReadingHistory() {
	const [readings, setReadings] = useState<Reading[]>(
		() => loadReadingHistory().readings,
	);
	const pendingPersistRef = useRef<Reading[] | null>(null);
	const persistTimerRef = useRef(0);

	const flushPersist = useCallback(() => {
		window.clearTimeout(persistTimerRef.current);
		if (pendingPersistRef.current) {
			saveReadingHistory({ readings: pendingPersistRef.current });
			pendingPersistRef.current = null;
		}
	}, []);

	const schedulePersist = useCallback((next: Reading[]) => {
		pendingPersistRef.current = next;
		window.clearTimeout(persistTimerRef.current);
		persistTimerRef.current = window.setTimeout(() => {
			if (pendingPersistRef.current) {
				saveReadingHistory({ readings: pendingPersistRef.current });
				pendingPersistRef.current = null;
			}
		}, PERSIST_DEBOUNCE_MS);
	}, []);

	useEffect(() => {
		const onVisibilityChange = () => {
			if (document.visibilityState === "hidden") {
				flushPersist();
			}
		};

		window.addEventListener("beforeunload", flushPersist);
		document.addEventListener("visibilitychange", onVisibilityChange);

		return () => {
			window.removeEventListener("beforeunload", flushPersist);
			document.removeEventListener("visibilitychange", onVisibilityChange);
			flushPersist();
		};
	}, [flushPersist]);

	const persist = useCallback(
		(
			updater: (current: Reading[]) => Reading[],
			options?: { immediate?: boolean },
		) => {
			setReadings((current) => {
				const next = updater(current);
				if (options?.immediate) {
					window.clearTimeout(persistTimerRef.current);
					pendingPersistRef.current = null;
					saveReadingHistory({ readings: next });
				} else {
					schedulePersist(next);
				}
				return next;
			});
		},
		[schedulePersist],
	);

	const addQuestion = useCallback(
		(question: string) => {
			const trimmed = question.trim();
			if (!trimmed) return null;

			const reading = createReading(trimmed);
			persist((current) => [...current, reading], { immediate: true });
			return reading;
		},
		[persist],
	);

	const beginSession = useCallback(() => {
		const reading = createReading("");
		persist(
			(current) => [
				...current.filter((item) => item.status === "complete"),
				reading,
			],
			{ immediate: true },
		);
		return reading;
	}, [persist]);

	const startReading = useCallback(() => {
		const reading = createReading("");
		persist((current) => [...current, reading], { immediate: true });
		return reading;
	}, [persist]);

	const updateReading = useCallback(
		(id: string, patch: Partial<Reading>) => {
			const immediate = patch.status === "complete";
			persist(
				(current) =>
					current.map((reading) =>
						reading.id === id ? { ...reading, ...patch } : reading,
					),
				{ immediate },
			);
		},
		[persist],
	);

	const clearHistory = useCallback(() => {
		persist(() => [], { immediate: true });
	}, [persist]);

	return {
		readings,
		hasReadings: readings.length > 0,
		addQuestion,
		beginSession,
		startReading,
		updateReading,
		clearHistory,
	};
}
