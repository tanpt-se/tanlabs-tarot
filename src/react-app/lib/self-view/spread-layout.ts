import {
	computeSpreadSlotRects,
	didSelfViewCardChangeRow as didSelfViewCardChangeRowLayouts,
	getSelfViewCardRowIndex as getSelfViewCardRowIndexFromSizes,
	hasSelfViewCrossRowShift as hasSelfViewCrossRowShiftLayouts,
	SELF_VIEW_MAX_SPREAD_CARDS,
	slotRectToViewport,
	shouldUseSelfViewLayoutFlight as shouldUseSelfViewLayoutFlightLayouts,
	type SelfViewSpreadLayoutResult,
	type SelfViewSpreadSlotRect,
} from "./spread-layout-engine";
import { CARD_ART_HEIGHT_ASPECT } from "../tarot/card-art-metrics";
import {
	createDefaultViewportConstraints,
	readSelfViewViewportConstraints,
} from "./spread-layout-metrics";
import {
	buildSpreadMoldLayout,
	didSpreadSizingProfileChange,
	isWideSelfViewSpread,
	SELF_VIEW_DESKTOP_TABLE_WIDTH_PX,
	SELF_VIEW_MOLD_SLOT_COUNT,
	resolveSpreadTableBounds,
	type SpreadSizingProfile,
	type SpreadSizeTier,
} from "./spread-table-layout";

export { SELF_VIEW_MAX_SPREAD_CARDS };
export {
	didSpreadSizingProfileChange,
	didSpreadTierChange,
	getSpreadSizingGrid,
	getSpreadSizingProfile,
	getSpreadSizeTier,
	getSelfViewMoldRowSizes,
	getVisibleMoldRowCount,
	getNarrowMoldRowSizes,
	getWideMoldRowSizes,
	isWideSelfViewSpread,
	resolveSpreadLayoutCardCount,
	SELF_VIEW_MOLD_ROW_SIZES,
	SELF_VIEW_MOLD_ROW_SIZES_WIDE,
} from "./spread-table-layout";
export type { SpreadSizingProfile, SpreadSizeTier, SelfViewSpreadSlotRect };

export type SelfViewSpreadLayout = SelfViewSpreadLayoutResult;

const layoutCache = new Map<string, SelfViewSpreadLayoutResult>();

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

function getViewportSize(options?: {
	viewportWidth?: number;
	viewportHeight?: number;
}): { width: number; height: number } {
	if (typeof window !== "undefined") {
		return {
			width: options?.viewportWidth ?? window.innerWidth,
			height: options?.viewportHeight ?? window.innerHeight,
		};
	}
	return {
		width: options?.viewportWidth ?? 1024,
		height: options?.viewportHeight ?? 768,
	};
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

function getLayoutCacheKey(
	cardCount: number,
	constraints: ReturnType<typeof resolveConstraints>,
	viewportWidth: number,
	viewportHeight: number,
): string {
	const table = resolveSpreadTableBounds(
		constraints,
		viewportWidth,
		viewportHeight,
	);
	return [
		cardCount,
		isWideSelfViewSpread(viewportWidth) ? "wide" : "narrow",
		table.contentWidthPx,
		table.contentHeightPx,
		Math.round(table.colGapPx * 10),
	].join(":");
}

function getSelfViewSpreadLayoutForCount(
	cardCount: number,
	options?: {
		viewportWidth?: number;
		viewportHeight?: number;
		constraints?: ReturnType<typeof readSelfViewViewportConstraints>;
	},
): SelfViewSpreadLayout {
	const constraints =
		options?.constraints ??
		resolveConstraints({
			viewportWidth: options?.viewportWidth,
			viewportHeight: options?.viewportHeight,
		});
	const viewport = getViewportSize(options);
	const cacheKey = getLayoutCacheKey(
		cardCount,
		constraints,
		viewport.width,
		viewport.height,
	);
	const cached = layoutCache.get(cacheKey);
	if (cached) return cached;

	const table = resolveSpreadTableBounds(
		constraints,
		viewport.width,
		viewport.height,
	);
	const layout = buildSpreadMoldLayout(table, cardCount, {
		viewportWidth: viewport.width,
		viewportHeight: viewport.height,
	});
	layoutCache.set(cacheKey, layout);
	return layout;
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
	return getSelfViewSpreadLayoutForCount(count, options);
}

export function getSelfViewSpreadMold(
	options?: {
		viewportWidth?: number;
		viewportHeight?: number;
		constraints?: ReturnType<typeof readSelfViewViewportConstraints>;
	},
): SelfViewSpreadLayout {
	return getSelfViewSpreadLayoutForCount(SELF_VIEW_MOLD_SLOT_COUNT, options);
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
	const viewport = getViewportSize(options);
	return didSpreadSizingProfileChange(
		previousCount,
		nextCount,
		isWideSelfViewSpread(viewport.width),
	);
}

export function getSelfViewSpreadStyle(
	layout: SelfViewSpreadLayout,
): Record<string, string | number> {
	return {
		"--self-view-layout-rows": layout.rows,
		"--self-view-card-width": `${layout.cardWidthPx}px`,
		"--self-view-card-height": `${layout.cardHeightPx}px`,
		"--self-view-spread-measured-h": `${layout.spreadHeightPx}px`,
		"--self-view-spread-table-width": `${layout.spreadWidthPx}px`,
		"--self-view-spread-gap": `${layout.colGapPx}px`,
		"--self-view-row-gap": `${layout.verticalGapSlicePx}px`,
		"--self-view-safe-pad-block": `${layout.safeArea.top}px`,
		"--self-view-safe-pad-bottom": `${layout.safeArea.bottom}px`,
		"--self-view-mold-max-cols": layout.maxCols,
		"--card-art-aspect-ratio": "400 / 680",
		"--spread-card-width": `${layout.cardWidthPx}px`,
	};
}

export function getSelfViewSpreadGapPx(cardCount: number): number {
	return getSelfViewSpreadLayout(cardCount).colGapPx;
}

export function getSelfViewCardRowIndex(
	cardIndex: number,
	cardCount: number,
	options?: {
		viewportWidth?: number;
		viewportHeight?: number;
	},
): number {
	const layout = getSelfViewSpreadLayout(cardCount, options);
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
	let layout =
		options?.layout ?? getSelfViewSpreadLayout(Math.max(cardCount, 1));

	if (options?.spreadWidthPx && options.spreadWidthPx > 0) {
		layout = { ...layout, spreadWidthPx: options.spreadWidthPx };
	}

	if (options?.cardWidthPx && options.cardWidthPx > 0) {
		layout = {
			...layout,
			cardWidthPx: options.cardWidthPx,
			cardHeightPx: options.cardWidthPx * CARD_ART_HEIGHT_ASPECT,
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

export const SELF_VIEW_WIDE_MIN_ZOOM_CARD_COUNT = 5;

export function canSelfViewZoom(
	cardIndex: number,
	cardCount: number,
	viewportWidth: number = typeof window !== "undefined"
		? window.innerWidth
		: SELF_VIEW_DESKTOP_TABLE_WIDTH_PX - 1,
): boolean {
	if (cardIndex < 0 || cardCount <= 0) return false;
	if (isWideSelfViewSpread(viewportWidth)) {
		return cardCount >= SELF_VIEW_WIDE_MIN_ZOOM_CARD_COUNT;
	}
	return true;
}

const SELF_VIEW_FOCUS_CARD_HEIGHT_VH = 0.6;

export function getSelfViewSingleCardWidth(): number {
	if (typeof window === "undefined") {
		return getSelfViewSpreadCardWidthPx(1);
	}

	const targetHeight = window.innerHeight * SELF_VIEW_FOCUS_CARD_HEIGHT_VH;
	const widthFromHeight = targetHeight / CARD_ART_HEIGHT_ASPECT;
	const widthFromViewport = window.innerWidth * 0.92;

	return Math.min(widthFromHeight, widthFromViewport);
}

export {
	createDefaultViewportConstraints,
	readSelfViewViewportConstraints,
} from "./spread-layout-metrics";
export {
	buildSpreadMoldLayout,
	SELF_VIEW_DESKTOP_TABLE_WIDTH_PX,
	SELF_VIEW_DESKTOP_TABLE_WIDTH_NARROW_PX,
	SELF_VIEW_MOLD_SLOT_COUNT,
	resolveSelfViewTableContentWidthPx,
	resolveSpreadTableBounds,
	solveSizingCardWidthPx,
	solveTierCardWidthPx,
} from "./spread-table-layout";
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
