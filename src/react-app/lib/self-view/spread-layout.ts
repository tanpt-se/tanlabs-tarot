export const SELF_VIEW_MAX_SPREAD_CARDS = 10;
export const SELF_VIEW_MIN_CARDS_FOR_ZOOM = 5;

export function canSelfViewZoom(cardCount: number): boolean {
	return cardCount >= SELF_VIEW_MIN_CARDS_FOR_ZOOM;
}

export type SelfViewSpreadLayout = {
	rowWidth: number;
	sizingRowWidth: number;
	rows: number;
	cardScale: number;
	rowSizes: number[];
};

/**
 * Row splits:
 * 1–4: one centered row | 5: 3+2 | 6: 3+3 | 7: 4+3 | 8: 4+4 | 9: 5+4 | 10: 5+5
 */
const ROW_WIDTH_BY_COUNT: Record<number, number> = {
	1: 1,
	2: 2,
	3: 3,
	4: 4,
	5: 3,
	6: 3,
	7: 4,
	8: 4,
	9: 5,
	10: 5,
};

/** Unified card size within each band (same approach as 1–4). */
const SIZE_GROUP_BY_COUNT: Record<number, { sizingRowWidth: number; cardScale: number }> =
	{
		1: { sizingRowWidth: 4, cardScale: 1.84 },
		2: { sizingRowWidth: 4, cardScale: 1.84 },
		3: { sizingRowWidth: 4, cardScale: 1.84 },
		4: { sizingRowWidth: 4, cardScale: 1.84 },
		5: { sizingRowWidth: 3, cardScale: 1.5 },
		6: { sizingRowWidth: 3, cardScale: 1.5 },
		7: { sizingRowWidth: 4, cardScale: 1.26 },
		8: { sizingRowWidth: 4, cardScale: 1.26 },
		9: { sizingRowWidth: 5, cardScale: 1.12 },
		10: { sizingRowWidth: 5, cardScale: 1.12 },
	};

function getSizeGroup(count: number) {
	return (
		SIZE_GROUP_BY_COUNT[count] ?? {
			sizingRowWidth: 5,
			cardScale: SIZE_GROUP_BY_COUNT[10]!.cardScale,
		}
	);
}

function buildRowSizes(cardCount: number): number[] {
	const rowWidth = ROW_WIDTH_BY_COUNT[cardCount] ?? 5;
	const rowSizes: number[] = [];
	let remaining = cardCount;

	while (remaining > 0) {
		const rowSize = Math.min(rowWidth, remaining);
		rowSizes.push(rowSize);
		remaining -= rowSize;
	}

	return rowSizes;
}

function getSizingRowWidth(count: number): number {
	return getSizeGroup(count).sizingRowWidth;
}

function getCardScale(count: number): number {
	return getSizeGroup(count).cardScale;
}

export function getSelfViewSpreadLayout(cardCount: number): SelfViewSpreadLayout {
	if (cardCount <= 0) {
		return {
			rowWidth: 1,
			sizingRowWidth: getSizingRowWidth(4),
			rows: 0,
			cardScale: 1,
			rowSizes: [],
		};
	}

	const count = Math.min(cardCount, SELF_VIEW_MAX_SPREAD_CARDS);
	const rowWidth = ROW_WIDTH_BY_COUNT[count] ?? 5;
	const rowSizes = buildRowSizes(count);
	const sizeGroup = getSizeGroup(count);

	return {
		rowWidth,
		sizingRowWidth: sizeGroup.sizingRowWidth,
		rows: rowSizes.length,
		cardScale: sizeGroup.cardScale,
		rowSizes,
	};
}

export function getSelfViewSpreadStyle(
	layout: SelfViewSpreadLayout,
): Record<string, string | number> {
	return {
		"--self-view-row-width": layout.rowWidth,
		"--self-view-sizing-row-width": layout.sizingRowWidth,
		"--self-view-layout-rows": layout.rows,
		"--self-view-card-scale": layout.cardScale,
	};
}

function readCssLengthPx(
	source: Element | null,
	varName: string,
	fallbackRem: number,
): number {
	if (typeof document === "undefined") {
		return fallbackRem * 16;
	}

	const rem =
		parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
	const styles = source
		? getComputedStyle(source)
		: getComputedStyle(document.documentElement);
	const raw = styles.getPropertyValue(varName).trim();
	if (!raw) return fallbackRem * rem;

	const probe = document.createElement("div");
	probe.style.position = "absolute";
	probe.style.visibility = "hidden";
	probe.style.pointerEvents = "none";
	probe.style.width = raw;
	document.body.appendChild(probe);
	const px = probe.getBoundingClientRect().width;
	probe.remove();
	return px || fallbackRem * rem;
}

type SelfViewCardWidthOptions = {
	/** Use layout max-width for the container, not the live (possibly narrower) spread wrap. */
	useLayoutContainerWidth?: boolean;
};

/** Mirrors `.self-view-spread-wrap` max-width for a given layout. */
function getSelfViewSpreadContainerWidthPx(
	layout: SelfViewSpreadLayout,
	cardMaxBase: number,
	spreadGap: number,
	rem: number,
	parentWidth: number,
): number {
	const intrinsic =
		layout.sizingRowWidth * cardMaxBase * layout.cardScale +
		(layout.sizingRowWidth - 1) * spreadGap +
		0.75 * rem;

	return Math.min(intrinsic, parentWidth);
}

/** Matches `.self-view-spread` card width for a given spread count. */
export function getSelfViewCardWidthPx(
	layout: SelfViewSpreadLayout,
	options?: SelfViewCardWidthOptions,
): number {
	if (typeof window === "undefined") {
		return 16 * 8.25 * getCardScale(1);
	}

	const shell = document.querySelector(".app-shell");
	const screen = document.querySelector(".self-view-screen");
	const spreadWrap = document.querySelector(".self-view-spread-wrap");
	const rem =
		parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

	const cardMaxBase = readCssLengthPx(
		screen,
		"--self-view-card-max-base",
		window.matchMedia("(max-width: 640px)").matches
			? 7
			: window.matchMedia("(min-width: 900px)").matches
				? 8.75
				: 8.25,
	);
	const spreadGap = readCssLengthPx(screen, "--self-view-spread-gap", 0.42);
	const frameSide = readCssLengthPx(shell, "--frame-side", 1.25);
	const frameTop = readCssLengthPx(shell, "--frame-top", 2);
	const frameBottom = readCssLengthPx(shell, "--frame-bottom", 2);
	const menuHeight = readCssLengthPx(
		document.documentElement,
		"--game-menu-item-min-height",
		4.15,
	);

	const cardMax = cardMaxBase * layout.cardScale;
	const chromeHeight = readCssLengthPx(
		document.documentElement,
		"--button-height",
		3.85,
	);
	const drawReserve = readCssLengthPx(screen, "--self-view-draw-reserve", 5);
	const appGap = 0.35 * rem;
	const animPadBlock = readCssLengthPx(
		screen,
		"--self-view-card-anim-pad-block",
		0.7,
	);
	const layoutFudge = readCssLengthPx(
		screen,
		"--self-view-spread-layout-fudge",
		1.1,
	);
	const wrapHeight =
		spreadWrap?.clientHeight ||
		window.innerHeight -
			frameTop -
			frameBottom -
			menuHeight -
			chromeHeight -
			appGap -
			drawReserve -
			0.5 * rem;
	const heightAspectDivisor = layout.rows === 1 ? 1.58 : 1.72;
	const heightLimited =
		(wrapHeight -
			layoutFudge -
			(layout.rows - 1) * spreadGap -
			layout.rows * animPadBlock) /
		layout.rows /
		heightAspectDivisor;
	const parentWidth =
		screen?.clientWidth || window.innerWidth - 2 * frameSide;
	const availableW = options?.useLayoutContainerWidth
		? getSelfViewSpreadContainerWidthPx(
				layout,
				cardMaxBase,
				spreadGap,
				rem,
				parentWidth,
			)
		: spreadWrap?.clientWidth || parentWidth;
	const widthLimited =
		(availableW - (layout.sizingRowWidth - 1) * spreadGap) /
		layout.sizingRowWidth;
	const scaleCap = layout.rows === 1 ? cardMax : Number.POSITIVE_INFINITY;

	return Math.min(scaleCap, heightLimited, widthLimited);
}

/** Layout for zoom target: one hero card centered on the viewport. */
export const SELF_VIEW_FOCUS_CARD_LAYOUT: SelfViewSpreadLayout = {
	rowWidth: 1,
	sizingRowWidth: 1,
	rows: 1,
	cardScale: 3,
	rowSizes: [1],
};

/** Target hero card height when zoomed (60vh). */
const SELF_VIEW_FOCUS_CARD_HEIGHT_VH = 0.6;
/** Matches `.tarot-card__inner` aspect-ratio 2 / 3.4 (height ÷ width). */
const SELF_VIEW_FOCUS_CARD_HEIGHT_RATIO = 3.4 / 2;

/**
 * Zoom target = prominent hero card sized from the viewport (not the multi-row spread slot).
 */
export function getSelfViewSingleCardWidth(): number {
	const layout = SELF_VIEW_FOCUS_CARD_LAYOUT;

	if (typeof window === "undefined") {
		return getSelfViewCardWidthPx(layout, { useLayoutContainerWidth: true });
	}

	const targetHeight = window.innerHeight * SELF_VIEW_FOCUS_CARD_HEIGHT_VH;
	const widthFromHeight = targetHeight / SELF_VIEW_FOCUS_CARD_HEIGHT_RATIO;
	const widthFromViewport = window.innerWidth * 0.92;

	return Math.min(widthFromHeight, widthFromViewport);
}
