import { createContext } from "react";
import type { ThemeId } from "../lib/theme/themes";

export interface ThemeContextValue {
	theme: ThemeId;
	setTheme: (theme: ThemeId) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
