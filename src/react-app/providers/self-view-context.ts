import { createContext } from "react";

export type SelfViewContextValue = {
	enabled: boolean;
	toggle: () => void;
	setEnabled: (enabled: boolean) => void;
};

export const SelfViewContext = createContext<SelfViewContextValue | null>(null);
