export const CARD_FLIP_DURATION_S = 0.55;
export const CARD_FLIP_DURATION_MS = CARD_FLIP_DURATION_S * 1000;

export const CARD_DEAL_STAGGER_S = 0.1;
export const CARD_DEAL_DURATION_S = 0.5;

export const CARD_DEAL_FLIGHT_DURATION_S = 0.55;
export const CARD_DEAL_FLIGHT_ARC_PX = 48;

export const SPREAD_SHUFFLE_DURATION_S = 0.9;
export const SPREAD_SHUFFLE_DURATION_MS = SPREAD_SHUFFLE_DURATION_S * 1000;

export const SELF_VIEW_SHUFFLE_DURATION_S = 0.78;
export const SELF_VIEW_REVEAL_SETTLE_S = 0.12;

export const SELF_VIEW_DRAW_SEQUENCE = {
	layoutResize: 0.28,
	layoutShift: 0.5,
	revealSettle: SELF_VIEW_REVEAL_SETTLE_S,
	flip: CARD_FLIP_DURATION_S,
} as const;

export const GSAP_EASE_OUT = "power3.out";
export const GSAP_EASE_IN_OUT = "power2.inOut";
export const GSAP_EASE_SPRING = "back.out(1.4)";
