import { lazy, Suspense, useEffect, useState } from "react";
import { loadSparkleAnimation } from "../../lib/vfx/sparkle-data";
import { prefersReducedMotion } from "../../lib/animation/reduced-motion";
import { useSfx } from "../../hooks/use-sfx";

const LottiePlayer = lazy(() => import("lottie-react"));

interface RevealSparkleProps {
	active: boolean;
	onComplete?: () => void;
}

export function RevealSparkle({ active, onComplete }: RevealSparkleProps) {
	const { vfxEnabled } = useSfx();
	const [animationData, setAnimationData] = useState<object | null>(null);

	useEffect(() => {
		if (!active || !vfxEnabled || prefersReducedMotion()) return;

		let cancelled = false;
		void loadSparkleAnimation().then((data) => {
			if (!cancelled) setAnimationData(data);
		});

		return () => {
			cancelled = true;
		};
	}, [active, vfxEnabled]);

	if (!active || !vfxEnabled || prefersReducedMotion() || !animationData) {
		return null;
	}

	return (
		<div className="reveal-sparkle" aria-hidden>
			<Suspense fallback={null}>
				<LottiePlayer
					animationData={animationData}
					loop={false}
					autoplay
					className="reveal-sparkle__player"
					onComplete={onComplete}
				/>
			</Suspense>
		</div>
	);
}
