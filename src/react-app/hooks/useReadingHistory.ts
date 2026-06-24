import { useCallback, useState } from "react";
import type { Reading } from "../lib/types/reading";
import {
	createReading,
	loadReadingHistory,
	saveReadingHistory,
} from "../lib/storage/reading-store";

export function useReadingHistory() {
	const [readings, setReadings] = useState<Reading[]>(
		() => loadReadingHistory().readings,
	);

	const persist = useCallback((updater: (current: Reading[]) => Reading[]) => {
		setReadings((current) => {
			const next = updater(current);
			saveReadingHistory({ readings: next });
			return next;
		});
	}, []);

	const addQuestion = useCallback(
		(question: string) => {
			const trimmed = question.trim();
			if (!trimmed) return null;

			const reading = createReading(trimmed);
			persist((current) => [...current, reading]);
			return reading;
		},
		[persist],
	);

	const beginSession = useCallback(() => {
		const reading = createReading("");
		persist((current) => [
			...current.filter((item) => item.status === "complete"),
			reading,
		]);
		return reading;
	}, [persist]);

	const startReading = useCallback(() => {
		const reading = createReading("");
		persist((current) => [...current, reading]);
		return reading;
	}, [persist]);

	const updateReading = useCallback(
		(id: string, patch: Partial<Reading>) => {
			persist((current) =>
				current.map((reading) =>
					reading.id === id ? { ...reading, ...patch } : reading,
				),
			);
		},
		[persist],
	);

	const clearHistory = useCallback(() => {
		persist(() => []);
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
