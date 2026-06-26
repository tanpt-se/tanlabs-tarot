interface CardFrontSkeletonProps {
	size?: "hero" | "thumb" | "avatar" | "spread" | "title";
}

export function CardFrontSkeleton({ size = "spread" }: CardFrontSkeletonProps) {
	return (
		<div className={`card-front-skeleton card-front-skeleton--${size}`}>
			<div className="card-frame">
				<div className="card-front-skeleton__fill" />
			</div>
		</div>
	);
}
