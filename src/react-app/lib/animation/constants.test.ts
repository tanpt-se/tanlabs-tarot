import { describe, expect, it } from "vitest";
import {
	CARD_DEAL_FLIGHT_DURATION_S,
	CARD_FLIP_DURATION_S,
	SELF_VIEW_DRAW_SEQUENCE,
} from "./constants";

describe("SELF_VIEW_DRAW_SEQUENCE", () => {
	it("matches plan v2.1 draw timings (~0.55s cycle)", () => {
		expect(SELF_VIEW_DRAW_SEQUENCE.layoutResize).toBe(0.2);
		expect(SELF_VIEW_DRAW_SEQUENCE.layoutShift).toBe(0.32);
		expect(SELF_VIEW_DRAW_SEQUENCE.layoutCommitDelay).toBe(0.05);
		expect(SELF_VIEW_DRAW_SEQUENCE.revealSettle).toBe(0.08);
		expect(SELF_VIEW_DRAW_SEQUENCE.cardStagger).toBe(0.03);
		expect(SELF_VIEW_DRAW_SEQUENCE.flightStartDelay).toBe(0.05);
		expect(SELF_VIEW_DRAW_SEQUENCE.flipOverlapStart).toBe(0.2);
		expect(SELF_VIEW_DRAW_SEQUENCE.flip).toBe(CARD_FLIP_DURATION_S);
		expect(CARD_FLIP_DURATION_S).toBe(0.35);
		expect(CARD_DEAL_FLIGHT_DURATION_S).toBe(0.3);
		expect(
			SELF_VIEW_DRAW_SEQUENCE.flightStartDelay +
				CARD_DEAL_FLIGHT_DURATION_S +
				SELF_VIEW_DRAW_SEQUENCE.flip,
		).toBeCloseTo(0.7, 2);
	});
});
