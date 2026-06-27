export type ThemeId = "classic" | "mystic";

export const THEME_STORAGE_KEY = "tarot-quest:theme";

export const THEMES: Record<ThemeId, { label: string }> = {
	classic: { label: "Classic" },
	mystic: { label: "Mystic" },
};

export const DEFAULT_THEME: ThemeId = "mystic";
