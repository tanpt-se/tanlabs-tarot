import { CARD_ART_HEIGHT_ASPECT } from "../tarot/card-art-metrics";
import type {
	SelfViewSafeArea,
	SelfViewSpreadLayoutResult,
	SelfViewViewportConstraints,
} from "./spread-layout-engine";

export const SELF_VIEW_MOLD_ROW_SIZES = [4, 4, 4] as const;

export const SELF_VIEW_MOLD_ROW_SIZES_WIDE = [6, 6] as const;

export const SELF_VIEW_MOLD_SLOT_COUNT = 12;

export const SELF_VIEW_DESKTOP_TABLE_WIDTH_PX = 980;

export const SELF_VIEW_NARROW_MAX_COLS_PER_ROW = 4;

/** @deprecated */
export const SELF_VIEW_DESKTOP_TABLE_WIDTH_NARROW_PX =
	SELF_VIEW_DESKTOP_TABLE_WIDTH_PX;

export type SpreadSizingProfile = 1 | 2 | 3 | 4 | 5;

/** @deprecated */
export type SpreadSizeTier = 1 | 2 | 3;

export type SpreadSizingGrid = {
	sizingRows: number;
	sizingCols: number;
};

export type SpreadTableBounds = {
	contentWidthPx: number;
	contentHeightPx: number;
	colGapPx: number;
	rowGapPx: number;
	safeArea: SelfViewSafeArea;
};

export function isWideSelfViewSpread(viewportWidth: number): boolean {
	return viewportWidth >= SELF_VIEW_DESKTOP_TABLE_WIDTH_PX;
}

export function getWideMoldRowSizes(cardCount: number): readonly number[] {
	const count = Math.max(1, Math.min(cardCount, SELF_VIEW_MOLD_SLOT_COUNT));
	if (count <= 3) return [3];
	if (count === 4) return [4];
	if (count <= 8) return [4, 4];
	if (count <= 10) return [5, 5];
	return [6, 6];
}

export function getNarrowMoldRowSizes(cardCount: number): readonly number[] {
	const count = Math.max(1, Math.min(cardCount, SELF_VIEW_MOLD_SLOT_COUNT));
	if (count <= 3) return [3];
	if (count === 4) return [4];
	if (count <= 8) return [4, 4];
	return [4, 4, 4];
}

export function getSelfViewMoldRowSizes(
	wide: boolean,
	cardCount: number = SELF_VIEW_MOLD_SLOT_COUNT,
): readonly number[] {
	return wide
		? getWideMoldRowSizes(cardCount)
		: getNarrowMoldRowSizes(cardCount);
}

export function resolveSpreadLayoutCardCount(drawnCount: number): number {
	if (drawnCount <= 0) return 1;
	if (drawnCount <= 3) return 3;
	if (drawnCount <= 4) return 4;
	if (drawnCount <= 8) return 8;
	return drawnCount;
}

export function getSpreadSizingProfile(
	cardCount: number,
	wide = false,
): SpreadSizingProfile {
	const count = Math.max(1, Math.min(cardCount, SELF_VIEW_MOLD_SLOT_COUNT));
	if (count <= 3) return 1;
	if (wide) {
		if (count === 4) return 2;
		if (count <= 8) return 3;
		if (count <= 10) return 4;
		return 5;
	}
	if (count === 4) return 2;
	if (count <= 8) return 3;
	return 4;
}

/** @deprecated */
export function getSpreadSizeTier(cardCount: number): SpreadSizeTier {
	const profile = getSpreadSizingProfile(cardCount, false);
	if (profile <= 2) return 1;
	if (profile === 3) return 2;
	return 3;
}

export function getSpreadSizingGrid(
	cardCount: number,
	wide = false,
): SpreadSizingGrid {
	const count = Math.max(1, Math.min(cardCount, SELF_VIEW_MOLD_SLOT_COUNT));
	if (count <= 3) {
		return { sizingRows: 1, sizingCols: 3 };
	}
	if (wide) {
		if (count === 4) {
			return { sizingRows: 1, sizingCols: 4 };
		}
		if (count <= 8) {
			return { sizingRows: 2, sizingCols: 4 };
		}
		if (count <= 10) {
			return { sizingRows: 2, sizingCols: 5 };
		}
		return { sizingRows: 2, sizingCols: 6 };
	}
	if (count === 4) {
		return { sizingRows: 1, sizingCols: 4 };
	}
	if (count <= 8) {
		return { sizingRows: 2, sizingCols: 4 };
	}
	return { sizingRows: 3, sizingCols: 4 };
}

export function getVisibleMoldRowCount(
	cardCount: number,
	wide = false,
): number {
	const count = Math.max(0, Math.min(cardCount, SELF_VIEW_MOLD_SLOT_COUNT));
	if (count <= 0) return 0;
	if (wide) {
		return count <= 4 ? 1 : 2;
	}
	if (count <= 4) return 1;
	if (count <= 8) return 2;
	return 3;
}

export function didSpreadSizingProfileChange(
	previousCount: number,
	nextCount: number,
	wide = false,
): boolean {
	if (previousCount <= 0 || nextCount <= 0) return false;
	return (
		getSpreadSizingProfile(previousCount, wide) !==
		getSpreadSizingProfile(nextCount, wide)
	);
}

/** @deprecated */
export function didSpreadTierChange(
	previousCount: number,
	nextCount: number,
): boolean {
	return didSpreadSizingProfileChange(previousCount, nextCount, false);
}

function snapCardWidth(value: number, minPx = 40): number {
	if (!Number.isFinite(value)) return minPx;
	return Math.max(minPx, Math.floor(value));
}

export function solveSizingCardWidthPx(
	table: SpreadTableBounds,
	grid: SpreadSizingGrid,
	cardCount?: number,
): number {
	const { sizingRows, sizingCols } = grid;
	const { contentWidthPx, contentHeightPx, colGapPx, rowGapPx } = table;
	const count = cardCount ?? sizingCols;

	const widthBudget =
		contentWidthPx - Math.max(0, sizingCols - 1) * colGapPx;
	const heightBudget =
		contentHeightPx - Math.max(0, sizingRows - 1) * rowGapPx;

	const fromWidth = widthBudget / sizingCols;
	const fromHeight = heightBudget / (sizingRows * CARD_ART_HEIGHT_ASPECT);

	let cardWidth =
		sizingRows === 1 ? fromWidth : Math.min(fromWidth, fromHeight);

	if (sizingRows === 1 && count > sizingCols) {
		const fitWidth =
			(contentWidthPx - Math.max(0, count - 1) * colGapPx) / count;
		cardWidth = Math.min(cardWidth, fitWidth);
	}

	return snapCardWidth(cardWidth);
}

/** @deprecated */
export function solveTierCardWidthPx(
	table: SpreadTableBounds,
	tier: SpreadSizeTier,
): number {
	const tierGrid: Record<SpreadSizeTier, SpreadSizingGrid> = {
		1: { sizingRows: 1, sizingCols: 3 },
		2: { sizingRows: 2, sizingCols: 5 },
		3: { sizingRows: 3, sizingCols: 5 },
	};
	return solveSizingCardWidthPx(table, tierGrid[tier]);
}

export function resolveSelfViewTableContentWidthPx(
	availableWidth: number,
	viewportWidth: number,
	viewportHeight: number,
): number {
	const isPortrait = viewportHeight >= viewportWidth;
	if (isPortrait || viewportWidth < SELF_VIEW_DESKTOP_TABLE_WIDTH_PX) {
		return availableWidth;
	}
	return Math.min(availableWidth, SELF_VIEW_DESKTOP_TABLE_WIDTH_PX);
}

export function resolveSpreadTableBounds(
	constraints: SelfViewViewportConstraints,
	viewportWidth: number,
	viewportHeight: number,
): SpreadTableBounds {
	const contentWidthPx = resolveSelfViewTableContentWidthPx(
		constraints.availableWidth,
		viewportWidth,
		viewportHeight,
	);

	return {
		contentWidthPx: Math.max(1, Math.floor(contentWidthPx)),
		contentHeightPx: Math.max(1, Math.floor(constraints.availableHeight)),
		colGapPx: constraints.colGapPx,
		rowGapPx: constraints.rowGapPx,
		safeArea: constraints.safeArea,
	};
}

export type BuildSpreadMoldLayoutOptions = {
	viewportWidth: number;
	viewportHeight?: number;
};

export function buildSpreadMoldLayout(
	table: SpreadTableBounds,
	cardCount: number,
	options: BuildSpreadMoldLayoutOptions,
): SelfViewSpreadLayoutResult {
	const count = Math.max(1, Math.min(cardCount, SELF_VIEW_MOLD_SLOT_COUNT));
	const wide = isWideSelfViewSpread(options.viewportWidth);
	const grid = getSpreadSizingGrid(count, wide);
	const visibleRows = getVisibleMoldRowCount(count, wide);
	const rowSizes = [...getSelfViewMoldRowSizes(wide, count)];
	const maxCols = Math.max(...rowSizes);
	const cardWidthPx = solveSizingCardWidthPx(table, grid, count);
	const cardHeightPx = cardWidthPx * CARD_ART_HEIGHT_ASPECT;

	const verticalGapSlicePx = Math.max(
		0,
		(table.contentHeightPx - visibleRows * cardHeightPx) / (visibleRows + 1),
	);

	const spreadHeightPx =
		visibleRows * cardHeightPx +
		(visibleRows + 1) * verticalGapSlicePx +
		table.safeArea.top +
		table.safeArea.bottom;

	return {
		rowSizes,
		rows: visibleRows,
		cardWidthPx,
		cardHeightPx,
		colGapPx: table.colGapPx,
		rowGapPx: table.rowGapPx,
		verticalGapSlicePx,
		safeArea: table.safeArea,
		spreadHeightPx,
		spreadWidthPx: table.contentWidthPx,
		maxCols,
		rowWidth: maxCols,
		sizingRowWidth: grid.sizingCols,
		cardScale: 1,
	};
}
