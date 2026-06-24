import { useContext } from "react";
import { SelfViewContext } from "../providers/self-view-context";

export function useSelfView() {
	const context = useContext(SelfViewContext);
	if (!context) {
		throw new Error("useSelfView must be used within SelfViewProvider");
	}

	return context;
}
