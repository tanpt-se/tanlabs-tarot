export function shouldIgnoreAppShortcut(event: KeyboardEvent): boolean {
	if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
		return true;
	}

	const target = event.target;
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;

	const tag = target.tagName;
	return (
		tag === "INPUT" ||
		tag === "TEXTAREA" ||
		tag === "SELECT" ||
		tag === "BUTTON" ||
		tag === "A"
	);
}

export function isGameModalOpen(): boolean {
	return Boolean(document.querySelector(".game-modal-overlay"));
}

export function isAppShortcutBlocked(
	hasOverlayOpen: () => boolean,
): boolean {
	return isGameModalOpen() || hasOverlayOpen();
}
