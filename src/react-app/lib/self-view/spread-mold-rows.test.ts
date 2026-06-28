import { describe, expect, it } from "vitest";
import {
	buildSpreadMoldRows,
	getSpreadMoldRowColCount,
} from "./spread-mold-rows";
import { resolveSpreadLayoutCardCount } from "./spread-table-layout";

describe("resolveSpreadLayoutCardCount", () => {
	it("stabilizes counts inside sizing bands", () => {
		expect(resolveSpreadLayoutCardCount(0)).toBe(1);
		expect(resolveSpreadLayoutCardCount(1)).toBe(3);
		expect(resolveSpreadLayoutCardCount(3)).toBe(3);
		expect(resolveSpreadLayoutCardCount(4)).toBe(4);
		expect(resolveSpreadLayoutCardCount(8)).toBe(8);
		expect(resolveSpreadLayoutCardCount(12)).toBe(12);
	});
});

describe("buildSpreadMoldRows", () => {
	it("trims trailing empty slots in a three-column row", () => {
		expect(
			buildSpreadMoldRows(2, { rowSizes: [3], rows: 1 }),
		).toEqual([[{ kind: "card", index: 0 }, { kind: "card", index: 1 }]]);
	});

	it("fills two mold rows for five cards", () => {
		expect(
			buildSpreadMoldRows(5, { rowSizes: [4, 4], rows: 2 }),
		).toEqual([
			[
				{ kind: "card", index: 0 },
				{ kind: "card", index: 1 },
				{ kind: "card", index: 2 },
				{ kind: "card", index: 3 },
			],
			[{ kind: "card", index: 4 }],
		]);
	});
});

describe("getSpreadMoldRowColCount", () => {
	it("uses filled card count when present", () => {
		const row = buildSpreadMoldRows(2, { rowSizes: [3], rows: 1 })[0]!;
		expect(getSpreadMoldRowColCount(row, 3)).toBe(2);
	});
});
