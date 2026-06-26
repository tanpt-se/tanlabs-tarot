export interface NarratorChoiceOption {
	title: string;
	description?: string;
	onSelect: () => void;
}

export interface NarratorChoicesConfig {
	options: NarratorChoiceOption[];
}
