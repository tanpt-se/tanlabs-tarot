import { describe, expect, it } from "vitest";
import {
	computeSpreadSlotRects,
	distributeCardsToRows,
	getDeviceProfile,
	getSpreadContentHeightPx,
	hasSelfViewCrossRowShift as hasSelfViewCrossRowShiftLayouts,
	shouldUseSelfViewLayoutFlight as shouldUseSelfViewLayoutFlightLayouts,
	solveSpreadLayout,
	SELF_VIEW_MAX_COLS_PER_ROW,
	SELF_VIEW_MAX_SPREAD_CARDS,
} from "./spread-layout-engine";
import { createDefaultViewportConstraints } from "./spread-layout-metrics";
import {
	didSelfViewLayoutResize,
	getSelfViewSpreadLayout,
} from "./spread-layout";

const MOBILE = createDefaultViewportConstraints(375, 667);
const DESKTOP = createDefaultViewportConstraints(1024, 768);

describe("createDefaultViewportConstraints", () => {
	it("caps spread width to 60vw in landscape desktop", () => {
		const desktop = createDefaultViewportConstraints(1024, 768);
		expect(desktop.availableWidth).toBeLessThanOrEqual(1024 * 0.6 + 0.5);
	});

	it("does not cap spread width in portrait tablet", () => {
		const tabletPortrait = createDefaultViewportConstraints(768, 1024);
		expect(tabletPortrait.availableWidth).toBeGreaterThan(768 * 0.6);
	});

	it("uses 2.25rem bottom safe area", () => {
		const constraints = createDefaultViewportConstraints(1024, 768);
		expect(constraints.safeArea.bottom).toBe(36);
	});

	it("does not cap mobile portrait width to 60vw", () => {
		const mobile = createDefaultViewportConstraints(375, 667);
		expect(mobile.availableWidth).toBeGreaterThan(375 * 0.6);
	});
});

describe("distributeCardsToRows", () => {
	it("distributes evenly with remainder to first rows", () => {
		expect(distributeCardsToRows(7, 3)).toEqual([3, 2, 2]);
		expect(distributeCardsToRows(10, 2)).toEqual([5, 5]);
	});
});

describe("solveSpreadLayout", () => {
	it("respects max rows per device profile", () => {
		const mobileProfile = getDeviceProfile(375);
		const desktopProfile = getDeviceProfile(1024);

		for (let count = 1; count <= SELF_VIEW_MAX_SPREAD_CARDS; count += 1) {
			const mobile = solveSpreadLayout(count, MOBILE, mobileProfile);
			const desktop = solveSpreadLayout(count, DESKTOP, desktopProfile);

			expect(mobile).not.toBeNull();
			expect(desktop).not.toBeNull();
			expect(mobile!.rows).toBeLessThanOrEqual(3);
			expect(desktop!.rows).toBeLessThanOrEqual(2);
			expect(Math.max(...mobile!.rowSizes)).toBeLessThanOrEqual(
				SELF_VIEW_MAX_COLS_PER_ROW,
			);
			expect(Math.max(...desktop!.rowSizes)).toBeLessThanOrEqual(
				SELF_VIEW_MAX_COLS_PER_ROW,
			);
		}
	});

	it("never uses more than five cards per row", () => {
		const desktopProfile = getDeviceProfile(1024);
		const layout = solveSpreadLayout(6, DESKTOP, desktopProfile)!;

		expect(layout.rows).toBeGreaterThan(1);
		expect(Math.max(...layout.rowSizes)).toBeLessThanOrEqual(3);
	});

	it("fits content inside available height", () => {
		const layout = solveSpreadLayout(10, MOBILE, getDeviceProfile(375))!;
		const contentHeight = getSpreadContentHeightPx(layout);
		expect(contentHeight).toBeLessThanOrEqual(MOBILE.availableHeight + 0.5);
	});

	it("desktop 10 cards uses two balanced rows", () => {
		const layout = solveSpreadLayout(10, DESKTOP, getDeviceProfile(1024))!;
		expect(layout.rows).toBe(2);
		expect(layout.rowSizes).toEqual([5, 5]);
	});

	it("card width decreases as row count increases on same viewport", () => {
		const profile = getDeviceProfile(375);
		const oneRow = solveSpreadLayout(3, MOBILE, {
			maxRows: 1,
			maxColsPerRow: SELF_VIEW_MAX_COLS_PER_ROW,
		})!;
		const twoRows = solveSpreadLayout(6, MOBILE, {
			maxRows: 2,
			maxColsPerRow: SELF_VIEW_MAX_COLS_PER_ROW,
		})!;
		const threeRows = solveSpreadLayout(9, MOBILE, profile)!;

		expect(oneRow.cardWidthPx).toBeGreaterThan(twoRows.cardWidthPx);
		expect(twoRows.cardWidthPx).toBeGreaterThan(threeRows.cardWidthPx);
	});

	it("includes bottom safe area in spread height", () => {
		const layout = solveSpreadLayout(2, MOBILE, getDeviceProfile(375))!;

		expect(layout.safeArea.bottom).toBe(36);
		expect(layout.spreadHeightPx).toBeCloseTo(
			MOBILE.availableHeight + layout.safeArea.top + layout.safeArea.bottom,
			0,
		);
	});

	it("caps single-card width below full spread width", () => {
		const layout = solveSpreadLayout(1, DESKTOP, getDeviceProfile(1024))!;
		expect(layout.cardWidthPx).toBeLessThan(layout.spreadWidthPx * 0.5);
	});
});

describe("computeSpreadSlotRects", () => {
	it("produces rects that stay within spread width", () => {
		const layout = getSelfViewSpreadLayout(8, {
			viewportWidth: 1024,
			viewportHeight: 768,
		});
		const rects = computeSpreadSlotRects(layout);

		rects.forEach((rect) => {
			expect(rect.left).toBeGreaterThanOrEqual(0);
			expect(rect.left + rect.width).toBeLessThanOrEqual(
				layout.spreadWidthPx + 0.5,
			);
			expect(rect.top).toBeGreaterThanOrEqual(layout.safeArea.top - 0.5);
		});
	});
});

describe("layout transition QA", () => {
	const mobileViewport = { viewportWidth: 375, viewportHeight: 667 };
	const desktopViewport = { viewportWidth: 1024, viewportHeight: 768 };
	const mobileProfile = getDeviceProfile(375);
	const desktopProfile = getDeviceProfile(1024);

	it("4→5 triggers layout resize on mobile", () => {
		expect(didSelfViewLayoutResize(4, 5, mobileViewport)).toBe(true);
	});

	it("6→7 triggers cross-row layout flight on mobile", () => {
		const previous = solveSpreadLayout(6, MOBILE, mobileProfile)!;
		const next = solveSpreadLayout(7, MOBILE, mobileProfile)!;

		expect(
			shouldUseSelfViewLayoutFlightLayouts(previous, next, 6),
		).toBe(true);
		expect(hasSelfViewCrossRowShiftLayouts(previous, next, 6)).toBe(true);
	});

	it("8→9 triggers layout resize on desktop", () => {
		expect(didSelfViewLayoutResize(8, 9, desktopViewport)).toBe(true);

		const previous = solveSpreadLayout(8, DESKTOP, desktopProfile)!;
		const next = solveSpreadLayout(9, DESKTOP, desktopProfile)!;
		expect(
			shouldUseSelfViewLayoutFlightLayouts(previous, next, 8),
		).toBe(true);
	});

	it("10 cards on mobile uses at most three rows", () => {
		const layout = getSelfViewSpreadLayout(10, mobileViewport);
		expect(layout.rows).toBeLessThanOrEqual(3);
		expect(layout.rowSizes.reduce((sum, size) => sum + size, 0)).toBe(10);
	});
});
