import { useLocale } from "../hooks/use-locale";

export function AppLoadingOverlay() {
	const { labels } = useLocale();

	return (
		<div
			className="app-loading"
			role="status"
			aria-live="polite"
			aria-busy="true"
			aria-label={labels.loading}
		>
			<div className="app-loading__spinner" aria-hidden />
		</div>
	);
}
