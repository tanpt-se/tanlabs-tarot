/** Matches `.tarot-card__inner` aspect-ratio 2 / 3.4 (height ÷ width). */
export const SELF_VIEW_CARD_HEIGHT_ASPECT = 3.4 / 2;

export const SELF_VIEW_MAX_SPREAD_CARDS = 10;

export const SELF_VIEW_MIN_CARD_WIDTH_PX = 48;

export const SELF_VIEW_MAX_COLS_PER_ROW = 5;

export const SELF_VIEW_MOBILE_BREAKPOINT_PX = 640;

export const SELF_VIEW_DESKTOP_SPREAD_WIDTH_RATIO = 0.6;

/** Cap single-row card width so one card does not fill the entire spread. */
export const SELF_VIEW_SINGLE_ROW_MAX_WIDTH_RATIO = 0.48;

export function shouldCapSelfViewSpreadWidth(
	viewportWidth: number,
	viewportHeight: number,
): boolean {
	return (
		viewportWidth > viewportHeight &&
		viewportWidth > SELF_VIEW_MOBILE_BREAKPOINT_PX
	);
}

export type SelfViewSafeArea = {
	top: number;
	bottom: number;
	side: number;
};

export type SelfViewViewportConstraints = {
	availableWidth: number;
	availableHeight: number;
	colGapPx: number;
	rowGapPx: number;
	safeArea: SelfViewSafeArea;
};

export type SelfViewDeviceProfile = {
	maxRows: number;
	maxColsPerRow: number;
};

export type SelfViewSpreadLayoutResult = {
	rowSizes: number[];
	rows: number;
	cardWidthPx: number;
	cardHeightPx: number;
	colGapPx: number;
	rowGapPx: number;
	verticalGapSlicePx: number;
	safeArea: SelfViewSafeArea;
	spreadHeightPx: number;
	spreadWidthPx: number;
	maxCols: number;
	/** @deprecated Use maxCols — kept for gradual migration */
	rowWidth: number;
	/** @deprecated Use maxCols */
	sizingRowWidth: number;
	/** @deprecated Use cardWidthPx */
	cardScale: number;
};

export type SelfViewSpreadSlotRect = {
	left: number;
	top: number;
	width: number;
	height: number;
};

export function getDeviceProfile(viewportWidth: number): SelfViewDeviceProfile {
	return {
		maxRows: viewportWidth <= SELF_VIEW_MOBILE_BREAKPOINT_PX ? 3 : 2,
		maxColsPerRow: SELF_VIEW_MAX_COLS_PER_ROW,
	};
}

/** Distribute cards across rows as evenly as possible (e.g. 7 → [3, 2, 2]). */
export function distributeCardsToRows(
	cardCount: number,
	rowCount: number,
): number[] {
	if (cardCount <= 0 || rowCount <= 0) return [];

	const base = Math.floor(cardCount / rowCount);
	const extra = cardCount % rowCount;
	const sizes: number[] = [];

	for (let row = 0; row < rowCount; row += 1) {
		sizes.push(base + (row < extra ? 1 : 0));
	}

	return sizes;
}

export function getSelfViewCardRowIndex(
	cardIndex: number,
	rowSizes: number[],
): number {
	let offset = 0;

	for (let row = 0; row < rowSizes.length; row += 1) {
		const rowSize = rowSizes[row] ?? 0;
		if (cardIndex < offset + rowSize) {
			return row;
		}
		offset += rowSize;
	}

	return Math.max(0, rowSizes.length - 1);
}

type SolveSpreadLayoutOptions = {
	minCardWidthPx?: number;
};

export function solveSpreadLayout(
	cardCount: number,
	constraints: SelfViewViewportConstraints,
	profile: SelfViewDeviceProfile,
	options?: SolveSpreadLayoutOptions,
): SelfViewSpreadLayoutResult | null {
	if (cardCount <= 0) return null;

	const minCardWidth = options?.minCardWidthPx ?? SELF_VIEW_MIN_CARD_WIDTH_PX;
	const { availableWidth, availableHeight, colGapPx, rowGapPx, safeArea } =
		constraints;
	const maxColsPerRow = profile.maxColsPerRow ?? SELF_VIEW_MAX_COLS_PER_ROW;
	const contentHeight = availableHeight;
	const spreadHeightPx =
		contentHeight + safeArea.top + safeArea.bottom;

	const minRowCount = Math.ceil(cardCount / maxColsPerRow);

	let best: SelfViewSpreadLayoutResult | null = null;

	for (
		let rowCount = minRowCount;
		rowCount <= Math.min(profile.maxRows, cardCount);
		rowCount += 1
	) {
		const rowSizes = distributeCardsToRows(cardCount, rowCount);
		const maxCols = Math.max(...rowSizes);

		if (maxCols > maxColsPerRow) {
			continue;
		}

		const cardWFromWidth =
			(availableWidth - Math.max(0, maxCols - 1) * colGapPx) / maxCols;

		const cardWFromHeight =
			(contentHeight - Math.max(0, rowCount - 1) * rowGapPx) /
			(rowCount * SELF_VIEW_CARD_HEIGHT_ASPECT);

		const cardWidthRaw = Math.min(cardWFromWidth, cardWFromHeight);
		const singleRowCap =
			maxCols === 1
				? availableWidth * SELF_VIEW_SINGLE_ROW_MAX_WIDTH_RATIO
				: Number.POSITIVE_INFINITY;
		const cardWidth = Math.min(cardWidthRaw, singleRowCap);
		if (!Number.isFinite(cardWidth) || cardWidth < minCardWidth) {
			continue;
		}

		const cardHeight = cardWidth * SELF_VIEW_CARD_HEIGHT_ASPECT;
		const verticalGapSlice =
			(contentHeight - rowCount * cardHeight) / (rowCount + 1);

		if (verticalGapSlice < 0) {
			continue;
		}

		const candidate: SelfViewSpreadLayoutResult = {
			rowSizes,
			rows: rowCount,
			cardWidthPx: cardWidth,
			cardHeightPx: cardHeight,
			colGapPx,
			rowGapPx,
			verticalGapSlicePx: verticalGapSlice,
			safeArea,
			spreadHeightPx,
			spreadWidthPx: availableWidth,
			maxCols,
			rowWidth: maxCols,
			sizingRowWidth: maxCols,
			cardScale: 1,
		};

		if (!best || cardWidth > best.cardWidthPx) {
			best = candidate;
		}
	}

	return best;
}

/** Slot positions inside `.self-view-spread` (top-left origin, px). */
export function computeSpreadSlotRects(
	layout: SelfViewSpreadLayoutResult,
): Map<number, SelfViewSpreadSlotRect> {
	const map = new Map<number, SelfViewSpreadSlotRect>();
	const {
		rowSizes,
		cardWidthPx,
		cardHeightPx,
		colGapPx,
		verticalGapSlicePx,
		spreadWidthPx,
		safeArea,
	} = layout;

	let cardIndex = 0;

	for (let row = 0; row < rowSizes.length; row += 1) {
		const rowSize = rowSizes[row] ?? 0;
		const rowContentWidth =
			rowSize * cardWidthPx + Math.max(0, rowSize - 1) * colGapPx;
		const rowLeft = Math.max(0, (spreadWidthPx - rowContentWidth) / 2);
		const rowTop =
			safeArea.top +
			verticalGapSlicePx +
			row * (cardHeightPx + verticalGapSlicePx);

		for (let col = 0; col < rowSize; col += 1) {
			map.set(cardIndex, {
				left: rowLeft + col * (cardWidthPx + colGapPx),
				top: rowTop,
				width: cardWidthPx,
				height: cardHeightPx,
			});
			cardIndex += 1;
		}
	}

	return map;
}

export function slotRectToViewport(
	slot: SelfViewSpreadSlotRect,
	spreadBounds: DOMRect,
): DOMRect {
	return new DOMRect(
		spreadBounds.left + slot.left,
		spreadBounds.top + slot.top,
		slot.width,
		slot.height,
	);
}

export function getSpreadContentHeightPx(layout: SelfViewSpreadLayoutResult): number {
	const { rows, cardHeightPx, verticalGapSlicePx } = layout;
	return rows * cardHeightPx + (rows + 1) * verticalGapSlicePx;
}

export function didSelfViewLayoutChange(
	previous: SelfViewSpreadLayoutResult | null,
	next: SelfViewSpreadLayoutResult | null,
	epsilon = 0.5,
): boolean {
	if (!previous || !next) return previous !== next;

	if (previous.rows !== next.rows || previous.maxCols !== next.maxCols) {
		return true;
	}

	if (Math.abs(previous.cardWidthPx - next.cardWidthPx) >= epsilon) {
		return true;
	}

	if (previous.rowSizes.length !== next.rowSizes.length) {
		return true;
	}

	return previous.rowSizes.some((size, index) => size !== next.rowSizes[index]);
}

export function didSelfViewCardChangeRow(
	cardIndex: number,
	previousLayout: SelfViewSpreadLayoutResult,
	nextLayout: SelfViewSpreadLayoutResult,
): boolean {
	return (
		getSelfViewCardRowIndex(cardIndex, previousLayout.rowSizes) !==
		getSelfViewCardRowIndex(cardIndex, nextLayout.rowSizes)
	);
}

export function hasSelfViewCrossRowShift(
	previousLayout: SelfViewSpreadLayoutResult,
	nextLayout: SelfViewSpreadLayoutResult,
	slotIndex: number,
): boolean {
	for (let index = 0; index < slotIndex; index += 1) {
		if (didSelfViewCardChangeRow(index, previousLayout, nextLayout)) {
			return true;
		}
	}
	return false;
}

export function shouldUseSelfViewLayoutFlight(
	previousLayout: SelfViewSpreadLayoutResult | null,
	nextLayout: SelfViewSpreadLayoutResult | null,
	slotIndex: number,
): boolean {
	if (!previousLayout || !nextLayout) return false;

	return (
		didSelfViewLayoutChange(previousLayout, nextLayout) ||
		hasSelfViewCrossRowShift(previousLayout, nextLayout, slotIndex)
	);
}
