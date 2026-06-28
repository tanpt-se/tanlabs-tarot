import { describe, expect, it } from "vitest";
import {
	canSelfViewZoom,
	SELF_VIEW_WIDE_MIN_ZOOM_CARD_COUNT,
} from "./spread-layout";
import { SELF_VIEW_DESKTOP_TABLE_WIDTH_PX } from "./spread-table-layout";

describe("canSelfViewZoom", () => {
	it("allows any card on viewports below 980px", () => {
		expect(
			canSelfViewZoom(0, 1, SELF_VIEW_DESKTOP_TABLE_WIDTH_PX - 1),
		).toBe(true);
		expect(canSelfViewZoom(3, 4, 800)).toBe(true);
	});

	it("blocks zoom on wide viewports with four or fewer cards", () => {
		expect(canSelfViewZoom(0, 4, SELF_VIEW_DESKTOP_TABLE_WIDTH_PX)).toBe(
			false,
		);
		expect(
			canSelfViewZoom(3, SELF_VIEW_WIDE_MIN_ZOOM_CARD_COUNT - 1, 1200),
		).toBe(false);
	});

	it("allows zoom for any card once five or more are drawn on wide viewports", () => {
		expect(
			canSelfViewZoom(0, SELF_VIEW_WIDE_MIN_ZOOM_CARD_COUNT, 1200),
		).toBe(true);
		expect(canSelfViewZoom(4, 8, SELF_VIEW_DESKTOP_TABLE_WIDTH_PX)).toBe(
			true,
		);
	});

	it("rejects invalid card indices", () => {
		expect(canSelfViewZoom(-1, 5, 800)).toBe(false);
		expect(canSelfViewZoom(0, 0, 800)).toBe(false);
	});
});
