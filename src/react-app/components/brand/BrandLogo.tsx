import type { ImgHTMLAttributes } from "react";
import { BRAND_LOGO } from "../../assets";

interface BrandLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
	alt?: string;
	size?: "sm" | "md" | "lg";
}

const sizes = {
	sm: "brand-logo--sm",
	md: "brand-logo--md",
	lg: "brand-logo--lg",
} as const;

export function BrandLogo({
	alt = "Tanlabs Tarot",
	size = "md",
	className = "",
	...props
}: BrandLogoProps) {
	return (
		<img
			className={`brand-logo ${sizes[size]} ${className}`.trim()}
			src={BRAND_LOGO}
			alt={alt}
			{...props}
		/>
	);
}
