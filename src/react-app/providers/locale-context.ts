import { createContext } from "react";
import type { Locale, UiLabels } from "../i18n";

export type LocaleContextValue = {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	labels: UiLabels;
	dateTimeLocale: string;
};

export const LocaleContext = createContext<LocaleContextValue | null>(null);
