import {
	useCallback,
	useLayoutEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	DEFAULT_LOCALE,
	LOCALE_STORAGE_KEY,
	getDateTimeLocale,
	getUiLabels,
	isLocale,
	type Locale,
} from "../i18n";
import { LocaleContext, type LocaleContextValue } from "./locale-context";

function readStoredLocale(): Locale {
	if (typeof localStorage === "undefined") return DEFAULT_LOCALE;

	const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
	return stored && isLocale(stored) ? stored : DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>(readStoredLocale);

	useLayoutEffect(() => {
		document.documentElement.lang = locale;
	}, [locale]);

	const setLocale = useCallback((nextLocale: Locale) => {
		document.documentElement.lang = nextLocale;
		setLocaleState(nextLocale);
		localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
	}, []);

	const value = useMemo<LocaleContextValue>(
		() => ({
			locale,
			setLocale,
			labels: getUiLabels(locale),
			dateTimeLocale: getDateTimeLocale(locale),
		}),
		[locale, setLocale],
	);

	return (
		<LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
	);
}
