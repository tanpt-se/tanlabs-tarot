import {
	SELF_VIEW_DESKTOP_SPREAD_WIDTH_RATIO,
	SELF_VIEW_MOBILE_BREAKPOINT_PX,
	shouldCapSelfViewSpreadWidth,
	type SelfViewViewportConstraints,
} from "./spread-layout-engine";

const DEFAULT_REM_PX = 16;
const DEFAULT_SAFE_BOTTOM_REM = 2.25;

function readCssLengthPx(
	source: Element | null,
	varName: string,
	fallbackRem: number,
	remPx: number,
): number {
	if (typeof document === "undefined") {
		return fallbackRem * remPx;
	}

	const styles = source
		? getComputedStyle(source)
		: getComputedStyle(document.documentElement);
	const raw = styles.getPropertyValue(varName).trim();
	if (!raw) return fallbackRem * remPx;

	const probe = document.createElement("div");
	probe.style.position = "absolute";
	probe.style.visibility = "hidden";
	probe.style.pointerEvents = "none";
	probe.style.width = raw;
	document.body.appendChild(probe);
	const px = probe.getBoundingClientRect().width;
	probe.remove();
	return px || fallbackRem * remPx;
}

export function getRemPx(): number {
	if (typeof document === "undefined") return DEFAULT_REM_PX;
	return parseFloat(getComputedStyle(document.documentElement).fontSize) || DEFAULT_REM_PX;
}

/** Default spread constraints when DOM is unavailable (SSR / tests). */
export function createDefaultViewportConstraints(
	viewportWidth: number,
	viewportHeight: number,
): SelfViewViewportConstraints {
	const rem = DEFAULT_REM_PX;
	const isMobile = viewportWidth <= SELF_VIEW_MOBILE_BREAKPOINT_PX;
	const side = isMobile ? 0.75 * rem : 1.25 * rem;
	const fullWidth = viewportWidth - 2 * side;
	const availableWidth = shouldCapSelfViewSpreadWidth(viewportWidth, viewportHeight)
		? Math.min(fullWidth, viewportWidth * SELF_VIEW_DESKTOP_SPREAD_WIDTH_RATIO)
		: fullWidth;

	return {
		availableWidth,
		availableHeight:
			viewportHeight -
			2 * rem -
			2 * rem -
			4.15 * rem -
			3.85 * rem -
			0.35 * rem -
			(4.15 * rem + 0.85 * rem) -
			0.5 * rem -
			0.5 * rem -
			DEFAULT_SAFE_BOTTOM_REM * rem,
		colGapPx: (isMobile ? 0.34 : 0.42) * rem,
		rowGapPx: (isMobile ? 0.34 : 0.42) * rem,
		safeArea: {
			top: 0.5 * rem,
			bottom: DEFAULT_SAFE_BOTTOM_REM * rem,
			side,
		},
	};
}

/** Read live viewport constraints from the self-view screen chrome. */
export function readSelfViewViewportConstraints(): SelfViewViewportConstraints | null {
	if (typeof window === "undefined") return null;

	const shell = document.querySelector(".app-shell");
	const screen = document.querySelector(".self-view-screen");
	const spreadWrap = document.querySelector(".self-view-spread-wrap");
	const rem = getRemPx();

	const frameSide = readCssLengthPx(shell, "--frame-side", 1.25, rem);
	const frameTop = readCssLengthPx(shell, "--frame-top", 2, rem);
	const frameBottom = readCssLengthPx(shell, "--frame-bottom", 2, rem);
	const menuHeight = readCssLengthPx(
		document.documentElement,
		"--game-menu-item-min-height",
		4.15,
		rem,
	);
	const chromeHeight = readCssLengthPx(
		document.documentElement,
		"--button-height",
		3.85,
		rem,
	);
	const drawReserve = readCssLengthPx(screen, "--self-view-draw-reserve", 5, rem);
	const colGapPx = readCssLengthPx(screen, "--self-view-spread-gap", 0.42, rem);
	const appGap = 0.35 * rem;
	const safeTop = 0.5 * rem;
	const safeBottom = readCssLengthPx(
		screen,
		"--self-view-safe-pad-bottom",
		DEFAULT_SAFE_BOTTOM_REM,
		rem,
	);

	const screenWidth = screen?.clientWidth || window.innerWidth - 2 * frameSide;
	let availableWidth = screenWidth;

	if (
		shouldCapSelfViewSpreadWidth(window.innerWidth, window.innerHeight)
	) {
		const maxSpreadWidthPx = readCssLengthPx(
			screen,
			"--self-view-spread-max-width",
			0,
			rem,
		);
		const widthCap =
			maxSpreadWidthPx > 0
				? maxSpreadWidthPx
				: window.innerWidth * SELF_VIEW_DESKTOP_SPREAD_WIDTH_RATIO;
		availableWidth = Math.min(screenWidth, widthCap);
	}

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

	const availableHeight = Math.max(0, wrapHeight - safeTop - safeBottom);

	return {
		availableWidth,
		availableHeight,
		colGapPx,
		rowGapPx: colGapPx,
		safeArea: {
			top: safeTop,
			bottom: safeBottom,
			side: frameSide,
		},
	};
}
