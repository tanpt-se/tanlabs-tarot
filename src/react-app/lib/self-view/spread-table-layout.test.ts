import { describe, expect, it } from "vitest";
import { createDefaultViewportConstraints } from "./spread-layout-metrics";
import {
	buildSpreadMoldLayout,
	getNarrowMoldRowSizes,
	getSelfViewMoldRowSizes,
	getSpreadSizingGrid,
	getSpreadSizingProfile,
	getSpreadSizeTier,
	getVisibleMoldRowCount,
	getWideMoldRowSizes,
	isWideSelfViewSpread,
	resolveSpreadTableBounds,
	solveSizingCardWidthPx,
	solveTierCardWidthPx,
	SELF_VIEW_DESKTOP_TABLE_WIDTH_PX,
	SELF_VIEW_MOLD_ROW_SIZES,
	SELF_VIEW_MOLD_ROW_SIZES_WIDE,
	SELF_VIEW_MOLD_SLOT_COUNT,
} from "./spread-table-layout";
import {
	didSelfViewLayoutResize,
	getSelfViewSpreadLayout,
} from "./spread-layout";
import { CARD_ART_HEIGHT_ASPECT } from "../tarot/card-art-metrics";

const MOBILE = createDefaultViewportConstraints(375, 667);
const DESKTOP = createDefaultViewportConstraints(1024, 768);
const WIDE_VIEWPORT = { viewportWidth: 1024, viewportHeight: 768 };
const NARROW_VIEWPORT = { viewportWidth: 800, viewportHeight: 600 };

describe("isWideSelfViewSpread", () => {
	it("enables the wide layout band at 980px and above", () => {
		expect(isWideSelfViewSpread(980)).toBe(true);
		expect(isWideSelfViewSpread(1024)).toBe(true);
		expect(isWideSelfViewSpread(979)).toBe(false);
	});
});

describe("getWideMoldRowSizes", () => {
	it("progresses row capacity at 5, 9, and 11 cards", () => {
		expect(getWideMoldRowSizes(3)).toEqual([3]);
		expect(getWideMoldRowSizes(4)).toEqual([4]);
		expect(getWideMoldRowSizes(5)).toEqual([4, 4]);
		expect(getWideMoldRowSizes(8)).toEqual([4, 4]);
		expect(getWideMoldRowSizes(9)).toEqual([5, 5]);
		expect(getWideMoldRowSizes(10)).toEqual([5, 5]);
		expect(getWideMoldRowSizes(11)).toEqual([6, 6]);
		expect(getWideMoldRowSizes(12)).toEqual([6, 6]);
	});
});

describe("getNarrowMoldRowSizes", () => {
	it("caps rows at four cards on mobile", () => {
		expect(getNarrowMoldRowSizes(3)).toEqual([3]);
		expect(getNarrowMoldRowSizes(4)).toEqual([4]);
		expect(getNarrowMoldRowSizes(5)).toEqual([4, 4]);
		expect(getNarrowMoldRowSizes(8)).toEqual([4, 4]);
		expect(getNarrowMoldRowSizes(12)).toEqual([4, 4, 4]);
	});
});

describe("getSelfViewMoldRowSizes", () => {
	it("uses count-aware molds on both viewport bands", () => {
		expect(getSelfViewMoldRowSizes(true, 12)).toEqual([6, 6]);
		expect(getSelfViewMoldRowSizes(true, 5)).toEqual([4, 4]);
		expect(getSelfViewMoldRowSizes(false, 3)).toEqual([3]);
		expect(getSelfViewMoldRowSizes(false, 12)).toEqual([4, 4, 4]);
	});
});

describe("getSpreadSizingProfile", () => {
	it("maps narrow card counts to four profiles", () => {
		expect(getSpreadSizingProfile(3, false)).toBe(1);
		expect(getSpreadSizingProfile(4, false)).toBe(2);
		expect(getSpreadSizingProfile(5, false)).toBe(3);
		expect(getSpreadSizingProfile(9, false)).toBe(4);
	});

	it("maps wide card counts to five profiles", () => {
		expect(getSpreadSizingProfile(4, true)).toBe(2);
		expect(getSpreadSizingProfile(5, true)).toBe(3);
		expect(getSpreadSizingProfile(8, true)).toBe(3);
		expect(getSpreadSizingProfile(9, true)).toBe(4);
		expect(getSpreadSizingProfile(11, true)).toBe(5);
	});

	it("legacy tier buckets still map coarsely", () => {
		expect(getSpreadSizeTier(4)).toBe(1);
		expect(getSpreadSizeTier(5)).toBe(2);
		expect(getSpreadSizeTier(12)).toBe(3);
	});
});

describe("getSpreadSizingGrid", () => {
	it("uses 1×3 and 1×4 bands on both modes", () => {
		expect(getSpreadSizingGrid(3, true)).toEqual({ sizingRows: 1, sizingCols: 3 });
		expect(getSpreadSizingGrid(4, false)).toEqual({ sizingRows: 1, sizingCols: 4 });
	});

	it("uses 2×4 from five cards on narrow viewports", () => {
		expect(getSpreadSizingGrid(5, false)).toEqual({ sizingRows: 2, sizingCols: 4 });
		expect(getSpreadSizingGrid(8, false)).toEqual({ sizingRows: 2, sizingCols: 4 });
	});

	it("uses 3×4 from nine cards on narrow viewports", () => {
		expect(getSpreadSizingGrid(9, false)).toEqual({ sizingRows: 3, sizingCols: 4 });
	});

	it("uses 2×4 from five cards on wide viewports", () => {
		expect(getSpreadSizingGrid(5, true)).toEqual({ sizingRows: 2, sizingCols: 4 });
		expect(getSpreadSizingGrid(8, true)).toEqual({ sizingRows: 2, sizingCols: 4 });
	});

	it("uses 2×5 from nine cards on wide viewports", () => {
		expect(getSpreadSizingGrid(9, true)).toEqual({ sizingRows: 2, sizingCols: 5 });
	});

	it("uses 2×6 from eleven cards on wide viewports", () => {
		expect(getSpreadSizingGrid(11, true)).toEqual({ sizingRows: 2, sizingCols: 6 });
	});

	it("six cards use two rows on narrow viewports", () => {
		expect(getSpreadSizingGrid(6, false)).toEqual({ sizingRows: 2, sizingCols: 4 });
	});
});

describe("getVisibleMoldRowCount", () => {
	it("drops to two rows from the fifth card on both bands", () => {
		expect(getVisibleMoldRowCount(4, true)).toBe(1);
		expect(getVisibleMoldRowCount(5, true)).toBe(2);
		expect(getVisibleMoldRowCount(4, false)).toBe(1);
		expect(getVisibleMoldRowCount(5, false)).toBe(2);
		expect(getVisibleMoldRowCount(9, false)).toBe(3);
	});
});

describe("spread table width", () => {
	it("caps landscape table at 980px when viewport is wider", () => {
		const wide = createDefaultViewportConstraints(1400, 800);
		const table = resolveSpreadTableBounds(wide, 1400, 800);
		expect(table.contentWidthPx).toBe(SELF_VIEW_DESKTOP_TABLE_WIDTH_PX);
	});

	it("uses full available width when viewport is below 980px", () => {
		const narrow = createDefaultViewportConstraints(800, 600);
		const table = resolveSpreadTableBounds(narrow, 800, 600);
		expect(table.contentWidthPx).toBe(narrow.availableWidth);
	});
});

describe("spread mold grid", () => {
	it("uses twelve slots in both molds", () => {
		expect(SELF_VIEW_MOLD_SLOT_COUNT).toBe(12);
		expect(SELF_VIEW_MOLD_ROW_SIZES).toEqual([4, 4, 4]);
		expect(SELF_VIEW_MOLD_ROW_SIZES_WIDE).toEqual([6, 6]);
	});

	it("puts the fifth card on row two when wide", () => {
		const table = resolveSpreadTableBounds(DESKTOP, 1024, 768);
		const layout = buildSpreadMoldLayout(table, 5, {
			viewportWidth: 1024,
			viewportHeight: 768,
		});
		expect(layout.rows).toBe(2);
		expect(layout.rowSizes).toEqual([4, 4]);
		const usedWidth =
			4 * layout.cardWidthPx + 3 * layout.colGapPx;
		expect(usedWidth).toBeLessThanOrEqual(table.contentWidthPx + 1);
	});

	it("six cards use two rows on narrow viewports", () => {
		const table = resolveSpreadTableBounds(
			createDefaultViewportConstraints(800, 600),
			800,
			600,
		);
		const layout = buildSpreadMoldLayout(table, 6, {
			viewportWidth: 800,
			viewportHeight: 600,
		});
		expect(layout.rows).toBe(2);
		expect(layout.rowSizes).toEqual([4, 4]);
	});

	it("puts the fifth card on row two when narrow", () => {
		const table = resolveSpreadTableBounds(MOBILE, 375, 667);
		const layout = buildSpreadMoldLayout(table, 5, {
			viewportWidth: 375,
			viewportHeight: 667,
		});
		expect(layout.rows).toBe(2);
		expect(layout.rowSizes).toEqual([4, 4]);
		const usedWidth =
			4 * layout.cardWidthPx + 3 * layout.colGapPx;
		expect(usedWidth).toBeLessThanOrEqual(table.contentWidthPx + 1);
	});

	it("three narrow cards fit one row without overflow", () => {
		const table = resolveSpreadTableBounds(MOBILE, 375, 667);
		const layout = buildSpreadMoldLayout(table, 3, {
			viewportWidth: 375,
			viewportHeight: 667,
		});
		expect(layout.rowSizes).toEqual([3]);
		const usedWidth =
			3 * layout.cardWidthPx + 2 * layout.colGapPx;
		expect(usedWidth).toBeLessThanOrEqual(table.contentWidthPx + 1);
	});

	it("snaps twelve wide cards to six columns per row", () => {
		const table = resolveSpreadTableBounds(DESKTOP, 1024, 768);
		const layout = buildSpreadMoldLayout(table, 12, {
			viewportWidth: 1024,
			viewportHeight: 768,
		});
		const usedWidth =
			6 * layout.cardWidthPx + 5 * layout.colGapPx;
		expect(usedWidth).toBeLessThanOrEqual(table.contentWidthPx + 1);
		expect(layout.cardHeightPx / layout.cardWidthPx).toBeCloseTo(
			CARD_ART_HEIGHT_ASPECT,
			5,
		);
	});
});

describe("getSelfViewSpreadLayout profiles", () => {
	it("resizes at profile boundaries on wide viewports", () => {
		expect(didSelfViewLayoutResize(4, 5, WIDE_VIEWPORT)).toBe(true);
		expect(didSelfViewLayoutResize(5, 6, WIDE_VIEWPORT)).toBe(false);
		expect(didSelfViewLayoutResize(8, 9, WIDE_VIEWPORT)).toBe(true);
		expect(didSelfViewLayoutResize(10, 11, WIDE_VIEWPORT)).toBe(true);
		expect(didSelfViewLayoutResize(4, 5, NARROW_VIEWPORT)).toBe(true);
		expect(didSelfViewLayoutResize(5, 6, NARROW_VIEWPORT)).toBe(false);
		expect(didSelfViewLayoutResize(8, 9, NARROW_VIEWPORT)).toBe(true);
	});

	it("wide five-card layout uses two rows of four slots", () => {
		const layout = getSelfViewSpreadLayout(5, WIDE_VIEWPORT);
		expect(layout.rows).toBe(2);
		expect(layout.rowSizes).toEqual([4, 4]);
	});

	it("fits twelve cards inside mobile table height", () => {
		const layout = getSelfViewSpreadLayout(12, {
			viewportWidth: 375,
			viewportHeight: 667,
		});
		const contentHeight =
			3 * layout.cardHeightPx + 4 * layout.verticalGapSlicePx;
		const table = resolveSpreadTableBounds(MOBILE, 375, 667);
		expect(contentHeight).toBeLessThanOrEqual(table.contentHeightPx + 1);
	});

	it("deprecated tier solver still works", () => {
		const table = resolveSpreadTableBounds(DESKTOP, 1024, 768);
		expect(solveTierCardWidthPx(table, 1)).toBeGreaterThan(0);
		expect(solveSizingCardWidthPx(table, getSpreadSizingGrid(1), 1)).toBeGreaterThan(0);
	});
});
