import { useContext } from "react";
import { SfxContext } from "../providers/sfx-context";

export function useSfx() {
	const ctx = useContext(SfxContext);
	if (!ctx) {
		throw new Error("useSfx must be used within SfxProvider");
	}
	return ctx;
}
