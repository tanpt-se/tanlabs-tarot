import { motion } from "framer-motion";
import { useContext, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
	gameModalOverlayMotion,
	gameModalOverlayTransition,
	gameModalPanelMotion,
	gameModalPanelTransition,
} from "../motion/screen-motion";
import { SelfViewSessionContext } from "../../providers/self-view-session-context";
import { GamePanel, type GamePanelProps } from "../GamePanel";

const MotionGamePanel = motion.create(GamePanel);

const defaultDialogProps = {
	role: "dialog" as const,
	"aria-modal": true as const,
	tabIndex: -1,
};

type GameModalFrameProps = {
	onClose: () => void;
	overlayClassName?: string;
	panelClassName?: string;
	panelSurfaceClassName?: string;
	children: ReactNode;
	panelProps?: Omit<
		GamePanelProps,
		"children" | "className" | "surfaceClassName" | "onClick"
	>;
};

export function GameModalFrame({
	onClose,
	overlayClassName = "",
	panelClassName = "",
	panelSurfaceClassName,
	children,
	panelProps,
}: GameModalFrameProps) {
	const session = useContext(SelfViewSessionContext);
	const dialogRef = useRef<HTMLElement>(null);

	useEffect(() => {
		dialogRef.current?.focus();
	}, []);

	useEffect(() => session?.registerOverlay(), [session]);

	const overlayClasses = ["game-modal-overlay", overlayClassName]
		.filter(Boolean)
		.join(" ");
	const panelClasses = ["game-modal", panelClassName].filter(Boolean).join(" ");

	return createPortal(
		<motion.div
			className={overlayClasses}
			role="presentation"
			onClick={onClose}
			{...gameModalOverlayMotion}
			transition={gameModalOverlayTransition}
		>
			<MotionGamePanel
				ref={dialogRef}
				className={panelClasses}
				surfaceClassName={panelSurfaceClassName}
				{...gameModalPanelMotion}
				transition={gameModalPanelTransition}
				onClick={(event) => event.stopPropagation()}
				{...defaultDialogProps}
				{...panelProps}
			>
				{children}
			</MotionGamePanel>
		</motion.div>,
		document.body,
	);
}
