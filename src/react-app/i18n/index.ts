import { en } from "./en";
import type { Locale, UiLabels } from "./types";
import { vi } from "./vi";

export type { Locale, UiLabels } from "./types";

const labelsByLocale: Record<Locale, UiLabels> = {
	en,
	vi,
};

export const LOCALE_STORAGE_KEY = "tarot-locale";
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
	return value === "en" || value === "vi";
}

export function getUiLabels(locale: Locale): UiLabels {
	return labelsByLocale[locale];
}

export function getDateTimeLocale(locale: Locale): string {
	return locale === "vi" ? "vi-VN" : "en-US";
}
