import { describe, expect, it } from "vitest";
import {
	computeSpreadSlotRects,
	distributeCardsToRows,
	getDeviceProfile,
	getSpreadContentHeightPx,
	solveSpreadLayout,
	SELF_VIEW_MAX_COLS_PER_ROW,
	SELF_VIEW_MAX_SPREAD_CARDS,
} from "./spread-layout-engine";
import { createDefaultViewportConstraints } from "./spread-layout-metrics";
import { getSelfViewSpreadLayout } from "./spread-layout";

const MOBILE = createDefaultViewportConstraints(375, 667);
const DESKTOP = createDefaultViewportConstraints(1024, 768);

describe("createDefaultViewportConstraints", () => {
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

describe("solveSpreadLayout (legacy solver)", () => {
	it("supports up to twelve cards", () => {
		expect(SELF_VIEW_MAX_SPREAD_CARDS).toBe(12);
	});

	it("respects max rows per device profile", () => {
		const mobileProfile = getDeviceProfile(375);
		const desktopProfile = getDeviceProfile(1024);

		for (let count = 1; count <= 12; count += 1) {
			const mobile = solveSpreadLayout(count, MOBILE, mobileProfile);
			expect(mobile).not.toBeNull();
			expect(Math.max(...mobile!.rowSizes)).toBeLessThanOrEqual(
				SELF_VIEW_MAX_COLS_PER_ROW,
			);
		}

		for (let count = 1; count <= 10; count += 1) {
			const desktop = solveSpreadLayout(count, DESKTOP, desktopProfile);
			expect(desktop).not.toBeNull();
			expect(Math.max(...desktop!.rowSizes)).toBeLessThanOrEqual(
				SELF_VIEW_MAX_COLS_PER_ROW,
			);
		}
	});

	it("fits content inside available height", () => {
		const layout = solveSpreadLayout(10, MOBILE, getDeviceProfile(375))!;
		const contentHeight = getSpreadContentHeightPx(layout);
		expect(contentHeight).toBeLessThanOrEqual(MOBILE.availableHeight + 0.5);
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
