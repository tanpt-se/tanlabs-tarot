const RAY_COUNT = 32;

function SunRays() {
	const rays = Array.from({ length: RAY_COUNT }, (_, index) => {
		const angle = (index / RAY_COUNT) * 360;
		return (
			<line
				key={angle}
				x1="200"
				y1="200"
				x2="200"
				y2="58"
				transform={`rotate(${angle} 200 200)`}
			/>
		);
	});

	return (
		<g className="sun-backdrop__rays" strokeWidth="1.25">
			{rays}
		</g>
	);
}

export function SunBackdrop() {
	return (
		<div className="sun-backdrop" aria-hidden="true">
			<svg
				className="sun-backdrop__svg"
				viewBox="0 0 400 400"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<radialGradient id="sun-halo-glow" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor="var(--palette-gold-pale)" stopOpacity="0.42" />
						<stop offset="48%" stopColor="var(--palette-gold-light)" stopOpacity="0.16" />
						<stop offset="100%" stopColor="var(--palette-gold)" stopOpacity="0" />
					</radialGradient>
					<filter id="sun-halo-soften" x="-20%" y="-20%" width="140%" height="140%">
						<feGaussianBlur stdDeviation="1.2" />
					</filter>
				</defs>

				<circle
					className="sun-backdrop__outer-glow"
					cx="200"
					cy="200"
					r="178"
					fill="url(#sun-halo-glow)"
					filter="url(#sun-halo-soften)"
				/>

				<SunRays />

				<circle
					className="sun-backdrop__ring sun-backdrop__ring--outer"
					cx="200"
					cy="200"
					r="156"
					fill="none"
					strokeWidth="1.5"
				/>
				<circle
					className="sun-backdrop__ring sun-backdrop__ring--mid"
					cx="200"
					cy="200"
					r="128"
					fill="none"
					strokeWidth="1"
				/>
				<circle
					className="sun-backdrop__disc"
					cx="200"
					cy="200"
					r="96"
					fill="url(#sun-halo-glow)"
				/>
				<circle
					className="sun-backdrop__ring sun-backdrop__ring--inner"
					cx="200"
					cy="200"
					r="64"
					fill="none"
					strokeWidth="2"
				/>
				<circle
					className="sun-backdrop__core"
					cx="200"
					cy="200"
					r="28"
					fill="var(--palette-gold-pale)"
					fillOpacity="0.35"
				/>
			</svg>
		</div>
	);
}
