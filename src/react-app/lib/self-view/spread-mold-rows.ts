export type SpreadMoldRowCell =
	| { kind: "card"; index: number }
	| { kind: "empty"; index: number };

type SpreadMoldLayout = {
	rowSizes: readonly number[];
	rows: number;
};

export function buildSpreadMoldRows(
	drawnCount: number,
	layout: SpreadMoldLayout,
): SpreadMoldRowCell[][] {
	const rows: SpreadMoldRowCell[][] = [];
	let offset = 0;

	for (let rowIndex = 0; rowIndex < layout.rowSizes.length; rowIndex += 1) {
		const rowSize = layout.rowSizes[rowIndex] ?? 0;

		if (rowIndex >= layout.rows) {
			offset += rowSize;
			continue;
		}

		const row: SpreadMoldRowCell[] = [];

		for (let col = 0; col < rowSize; col += 1) {
			const slotIndex = offset + col;

			if (slotIndex < drawnCount) {
				row.push({ kind: "card", index: slotIndex });
			} else {
				row.push({ kind: "empty", index: slotIndex });
			}
		}

		while (row.length > 0 && row[row.length - 1]?.kind === "empty") {
			row.pop();
		}

		rows.push(row);
		offset += rowSize;
	}

	return rows;
}

export function getSpreadMoldRowColCount(
	rowItems: SpreadMoldRowCell[],
	fallbackCols: number,
): number {
	const filledCols = rowItems.filter((item) => item.kind === "card").length;
	return filledCols > 0 ? filledCols : fallbackCols;
}
