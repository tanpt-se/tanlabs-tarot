export interface NarratorAdvanceConfig {
	onAdvance: () => void;
	label: string;
	disabled?: boolean;
	layout?: "icon" | "nav";
}
