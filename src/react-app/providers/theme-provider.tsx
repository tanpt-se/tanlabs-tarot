import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	DEFAULT_THEME,
	THEME_STORAGE_KEY,
	type ThemeId,
} from "../lib/theme/themes";
import { ThemeContext } from "./theme-context";

function readStoredTheme(): ThemeId {
	if (typeof localStorage === "undefined") return DEFAULT_THEME;
	const stored = localStorage.getItem(THEME_STORAGE_KEY);
	return stored === "classic" || stored === "mystic" ? stored : DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<ThemeId>(readStoredTheme);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	}, [theme]);

	const setTheme = useCallback((next: ThemeId) => {
		setThemeState(next);
	}, []);

	const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}
