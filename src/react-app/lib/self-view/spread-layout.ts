import {
	computeSpreadSlotRects,
	didSelfViewCardChangeRow as didSelfViewCardChangeRowLayouts,
	didSelfViewLayoutChange,
	getDeviceProfile,
	getSelfViewCardRowIndex as getSelfViewCardRowIndexFromSizes,
	hasSelfViewCrossRowShift as hasSelfViewCrossRowShiftLayouts,
	SELF_VIEW_MAX_SPREAD_CARDS,
	solveSpreadLayout,
	slotRectToViewport,
	shouldUseSelfViewLayoutFlight as shouldUseSelfViewLayoutFlightLayouts,
	type SelfViewSpreadLayoutResult,
	type SelfViewSpreadSlotRect,
} from "./spread-layout-engine";
import {
	createDefaultViewportConstraints,
	readSelfViewViewportConstraints,
} from "./spread-layout-metrics";

export { SELF_VIEW_MAX_SPREAD_CARDS };
export type { SelfViewSpreadSlotRect };

export type SelfViewSpreadLayout = SelfViewSpreadLayoutResult;

const layoutCache = new Map<string, SelfViewSpreadLayoutResult | null>();

function getLayoutCacheKey(
	cardCount: number,
	constraints: ReturnType<typeof readSelfViewViewportConstraints>,
): string {
	if (!constraints) return `${cardCount}:default`;
	return [
		cardCount,
		Math.round(constraints.availableWidth),
		Math.round(constraints.availableHeight),
		Math.round(constraints.colGapPx * 10),
	].join(":");
}

function resolveConstraints(
	overrides?: Partial<{
		viewportWidth: number;
		viewportHeight: number;
	}>,
) {
	const live = readSelfViewViewportConstraints();
	if (live) return live;

	if (overrides?.viewportWidth && overrides?.viewportHeight) {
		return createDefaultViewportConstraints(
			overrides.viewportWidth,
			overrides.viewportHeight,
		);
	}

	return createDefaultViewportConstraints(1024, 768);
}

function emptyLayout(): SelfViewSpreadLayout {
	return {
		rowSizes: [],
		rows: 0,
		cardWidthPx: 0,
		cardHeightPx: 0,
		colGapPx: 0,
		rowGapPx: 0,
		verticalGapSlicePx: 0,
		safeArea: { top: 0, bottom: 0, side: 0 },
		spreadHeightPx: 0,
		spreadWidthPx: 0,
		maxCols: 1,
		rowWidth: 1,
		sizingRowWidth: 1,
		cardScale: 1,
	};
}

export function getSelfViewSpreadLayout(
	cardCount: number,
	options?: {
		viewportWidth?: number;
		viewportHeight?: number;
		constraints?: ReturnType<typeof readSelfViewViewportConstraints>;
	},
): SelfViewSpreadLayout {
	if (cardCount <= 0) {
		return emptyLayout();
	}

	const count = Math.min(cardCount, SELF_VIEW_MAX_SPREAD_CARDS);
	const constraints =
		options?.constraints ??
		resolveConstraints({
			viewportWidth: options?.viewportWidth,
			viewportHeight: options?.viewportHeight,
		});

	const cacheKey = getLayoutCacheKey(count, constraints);
	const cached = layoutCache.get(cacheKey);
	if (cached) return cached;

	const profile = getDeviceProfile(constraints.availableWidth);
	const solved = solveSpreadLayout(count, constraints, profile);

	const layout = solved ?? emptyLayout();
	layoutCache.set(cacheKey, layout);
	return layout;
}

export function clearSelfViewSpreadLayoutCache(): void {
	layoutCache.clear();
}

export function didSelfViewLayoutResize(
	previousCount: number,
	nextCount: number,
	options?: {
		viewportWidth?: number;
		viewportHeight?: number;
	},
): boolean {
	if (previousCount <= 0 || nextCount <= 0) return false;

	const prev = getSelfViewSpreadLayout(previousCount, options);
	const next = getSelfViewSpreadLayout(nextCount, options);
	return didSelfViewLayoutChange(prev, next);
}

export function getSelfViewSpreadStyle(
	layout: SelfViewSpreadLayout,
): Record<string, string | number> {
	return {
		"--self-view-layout-rows": layout.rows,
		"--self-view-card-width": `${layout.cardWidthPx}px`,
		"--self-view-spread-measured-h": `${layout.spreadHeightPx}px`,
		"--self-view-spread-gap": `${layout.colGapPx}px`,
		"--self-view-row-gap": `${layout.verticalGapSlicePx}px`,
		"--self-view-safe-pad-block": `${layout.safeArea.top}px`,
		"--self-view-safe-pad-bottom": `${layout.safeArea.bottom}px`,
		"--spread-card-width": `${layout.cardWidthPx}px`,
	};
}

export function getSelfViewSpreadGapPx(cardCount: number): number {
	return getSelfViewSpreadLayout(cardCount).colGapPx;
}

export function getSelfViewCardRowIndex(
	cardIndex: number,
	cardCount: number,
): number {
	const layout = getSelfViewSpreadLayout(cardCount);
	return getSelfViewCardRowIndexFromSizes(cardIndex, layout.rowSizes);
}

export function didSelfViewCardChangeRow(
	cardIndex: number,
	previousCount: number,
	nextCount: number,
): boolean {
	if (previousCount <= 0 || nextCount <= 0) return false;

	const prev = getSelfViewSpreadLayout(previousCount);
	const next = getSelfViewSpreadLayout(nextCount);
	return didSelfViewCardChangeRowLayouts(cardIndex, prev, next);
}

export function hasSelfViewCrossRowShift(
	previousCount: number,
	nextCount: number,
	slotIndex: number,
): boolean {
	const prev = getSelfViewSpreadLayout(previousCount);
	const next = getSelfViewSpreadLayout(nextCount);
	return hasSelfViewCrossRowShiftLayouts(prev, next, slotIndex);
}

export function shouldUseSelfViewLayoutFlight(
	previousCount: number,
	nextCount: number,
	slotIndex: number,
): boolean {
	const prev = getSelfViewSpreadLayout(previousCount);
	const next = getSelfViewSpreadLayout(nextCount);
	return shouldUseSelfViewLayoutFlightLayouts(prev, next, slotIndex);
}

export function computeSelfViewSpreadSlotRects(
	cardCount: number,
	options?: {
		cardWidthPx?: number;
		spreadWidthPx?: number;
		layout?: SelfViewSpreadLayout;
	},
): Map<number, SelfViewSpreadSlotRect> {
	let layout = options?.layout ?? getSelfViewSpreadLayout(cardCount);

	if (options?.spreadWidthPx && options.spreadWidthPx > 0) {
		layout = { ...layout, spreadWidthPx: options.spreadWidthPx };
	}

	if (options?.cardWidthPx && options.cardWidthPx > 0) {
		const aspect = layout.cardHeightPx / layout.cardWidthPx;
		layout = {
			...layout,
			cardWidthPx: options.cardWidthPx,
			cardHeightPx: options.cardWidthPx * aspect,
		};
	}

	return computeSpreadSlotRects(layout);
}

export { slotRectToViewport };

export function getSelfViewSpreadCardWidthPx(cardCount: number): number {
	return getSelfViewSpreadLayout(cardCount).cardWidthPx;
}

export function getSelfViewSpreadMeasuredHeightPx(
	cardCount: number,
	_cardWidthPx?: number,
): number {
	return getSelfViewSpreadLayout(cardCount).spreadHeightPx;
}

export function canSelfViewZoom(cardCount: number): boolean {
	return cardCount >= 1;
}

/** Target hero card width when zoomed (60vh). */
const SELF_VIEW_FOCUS_CARD_HEIGHT_VH = 0.6;

export function getSelfViewSingleCardWidth(): number {
	if (typeof window === "undefined") {
		return getSelfViewSpreadCardWidthPx(1);
	}

	const targetHeight = window.innerHeight * SELF_VIEW_FOCUS_CARD_HEIGHT_VH;
	const widthFromHeight = targetHeight / (3.4 / 2);
	const widthFromViewport = window.innerWidth * 0.92;

	return Math.min(widthFromHeight, widthFromViewport);
}

export {
	createDefaultViewportConstraints,
	readSelfViewViewportConstraints,
} from "./spread-layout-metrics";
export {
	computeSpreadSlotRects,
	distributeCardsToRows,
	getDeviceProfile,
	getSpreadContentHeightPx,
	solveSpreadLayout,
	SELF_VIEW_DESKTOP_SPREAD_WIDTH_RATIO,
	SELF_VIEW_SINGLE_ROW_MAX_WIDTH_RATIO,
	shouldCapSelfViewSpreadWidth,
	type SelfViewViewportConstraints,
} from "./spread-layout-engine";
