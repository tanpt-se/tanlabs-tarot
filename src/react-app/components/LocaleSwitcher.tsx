import type { Locale } from "../i18n";
import { useLocale } from "../hooks/use-locale";

const locales: { value: Locale; labelKey: "localeEn" | "localeVi" }[] = [
	{ value: "en", labelKey: "localeEn" },
	{ value: "vi", labelKey: "localeVi" },
];

export function LocaleSwitcher() {
	const { locale, setLocale, labels } = useLocale();

	return (
		<div className="locale-switcher" role="group" aria-label={labels.language}>
			{locales.map((item) => (
				<button
					key={item.value}
					type="button"
					className="locale-switcher__button"
					data-active={locale === item.value}
					aria-pressed={locale === item.value}
					onClick={() => setLocale(item.value)}
				>
					{labels[item.labelKey]}
				</button>
			))}
		</div>
	);
}
