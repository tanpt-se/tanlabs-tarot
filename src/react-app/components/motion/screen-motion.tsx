import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { prefersReducedMotion } from "../../lib/animation/reduced-motion";

const reduced = prefersReducedMotion();

const motionFadeUp = {
	initial: reduced ? false : { opacity: 0, y: 18 },
	animate: { opacity: 1, y: 0 },
	exit: reduced ? undefined : { opacity: 0, y: -12 },
};

const motionFade = {
	initial: reduced ? false : { opacity: 0 },
	animate: { opacity: 1 },
	exit: reduced ? undefined : { opacity: 0 },
};

export const motionSpring = reduced
	? { duration: 0 }
	: { type: "spring" as const, stiffness: 380, damping: 32 };

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
}

export function ScreenTransition({ children, className }: ScreenTransitionProps) {
	return (
		<motion.div
			className={className}
			{...motionFade}
			transition={{ duration: reduced ? 0 : 0.35, ease: "easeOut" }}
		>
			{children}
		</motion.div>
	);
}
