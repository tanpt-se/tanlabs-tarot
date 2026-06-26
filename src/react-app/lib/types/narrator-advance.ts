export interface NarratorAdvanceConfig {
	onAdvance: () => void;
	label: string;
	disabled?: boolean;
	layout?: "icon" | "nav";
	showIcon?: boolean;
	/** When false, advance stays clickable during typewriter (e.g. I'm ready). */
	blockWhileTyping?: boolean;
}
