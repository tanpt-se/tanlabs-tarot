import { motion, type HTMLMotionProps, type Transition } from "framer-motion";
import type { ReactNode } from "react";
import { prefersReducedMotion } from "../../lib/animation/reduced-motion";

const reduced = prefersReducedMotion();

const motionFadeUp = {
	initial: reduced ? false : { opacity: 0, y: 18 },
	animate: { opacity: 1, y: 0 },
	exit: reduced ? undefined : { opacity: 0, y: -12 },
};

export const motionSpring = reduced
	? { duration: 0 }
	: { type: "spring" as const, stiffness: 380, damping: 32 };

export const gameModalOverlayMotion = {
	initial: reduced ? false : { opacity: 0 },
	animate: { opacity: 1 },
	exit: reduced ? undefined : { opacity: 0 },
};

export const gameModalPanelMotion = {
	initial: reduced ? false : { opacity: 0, y: 64, scale: 0.9 },
	animate: { opacity: 1, y: 0, scale: 1 },
	exit: reduced ? undefined : { opacity: 0, y: 40, scale: 0.94 },
};

export const gameModalOverlayTransition: Transition = reduced
	? { duration: 0 }
	: { duration: 0.22, ease: "easeOut" };

export const gameModalPanelTransition: Transition = reduced
	? { duration: 0 }
	: { type: "spring", stiffness: 400, damping: 30, mass: 0.82 };

const screenVariants = {
	default: {
		initial: reduced ? false : { opacity: 0 },
		animate: { opacity: 1 },
		exit: reduced ? undefined : { opacity: 0 },
	},
	home: {
		initial: reduced ? false : { opacity: 0, y: -28, scale: 0.97 },
		animate: { opacity: 1, y: 0, scale: 1 },
		exit: reduced ? undefined : { opacity: 0, y: -20, scale: 0.98 },
	},
	"self-view": {
		initial: reduced ? false : { opacity: 0, y: "100%" },
		animate: { opacity: 1, y: 0 },
		exit: reduced ? undefined : { opacity: 0, y: "100%" },
	},
} as const;

const screenTransitions: Record<
	keyof typeof screenVariants,
	Transition
> = {
	default: reduced ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
	home: reduced ? { duration: 0 } : { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
	"self-view": reduced
		? { duration: 0 }
		: { type: "spring", stiffness: 260, damping: 32, mass: 0.95 },
};

export type ScreenTransitionVariant = keyof typeof screenVariants;

interface StaggerFadeInProps extends HTMLMotionProps<"div"> {
	children: ReactNode;
	delay?: number;
}

export function StaggerFadeIn({
	children,
	delay = 0,
	...props
}: StaggerFadeInProps) {
	return (
		<motion.div
			{...motionFadeUp}
			transition={{ ...motionSpring, delay }}
			{...props}
		>
			{children}
		</motion.div>
	);
}

interface ScreenTransitionProps {
	children: ReactNode;
	className?: string;
	variant?: ScreenTransitionVariant;
}

export function ScreenTransition({
	children,
	className,
	variant = "default",
}: ScreenTransitionProps) {
	const motionState = screenVariants[variant];

	return (
		<motion.div
			className={className}
			initial={motionState.initial}
			animate={motionState.animate}
			exit={motionState.exit}
			transition={screenTransitions[variant]}
		>
			{children}
		</motion.div>
	);
}
