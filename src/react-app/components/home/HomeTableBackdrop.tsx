const POV_IMAGE_WEBP = "/backgrounds/tarot-table-backdrop.webp";
const POV_IMAGE_PNG = "/backgrounds/tarot-table-backdrop.png";

export function HomeTableBackdrop() {
	return (
		<div className="home-pov-backdrop" aria-hidden="true">
			<picture className="home-pov-backdrop__picture">
				<source srcSet={POV_IMAGE_WEBP} type="image/webp" />
				<img
					className="home-pov-backdrop__image"
					src={POV_IMAGE_PNG}
					alt=""
					loading="eager"
					decoding="async"
					fetchPriority="high"
				/>
			</picture>

			<div className="home-pov-backdrop__grade" />
			<div className="home-pov-backdrop__playfield-zone" />
			<div className="home-pov-backdrop__vignette" />
			<div className="home-pov-backdrop__candle-warm" />
		</div>
	);
}
