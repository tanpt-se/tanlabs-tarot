import {
	useCallback,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { SelfViewContext, type SelfViewContextValue } from "./self-view-context";

const SELF_VIEW_STORAGE_KEY = "tarot-self-view-enabled";

function readStoredEnabled(): boolean {
	if (typeof localStorage === "undefined") return false;
	return localStorage.getItem(SELF_VIEW_STORAGE_KEY) === "true";
}

export function SelfViewProvider({ children }: { children: ReactNode }) {
	const [enabled, setEnabledState] = useState(readStoredEnabled);

	const setEnabled = useCallback((next: boolean) => {
		setEnabledState(next);
		localStorage.setItem(SELF_VIEW_STORAGE_KEY, String(next));
	}, []);

	const toggle = useCallback(() => {
		setEnabled(!enabled);
	}, [enabled, setEnabled]);

	const value = useMemo<SelfViewContextValue>(
		() => ({ enabled, toggle, setEnabled }),
		[enabled, setEnabled, toggle],
	);

	return (
		<SelfViewContext.Provider value={value}>{children}</SelfViewContext.Provider>
	);
}
