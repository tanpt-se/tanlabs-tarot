import { useContext } from "react";
import { SelfViewSessionContext } from "../providers/self-view-session-context";

export function useSelfViewSession() {
	const context = useContext(SelfViewSessionContext);
	if (!context) {
		throw new Error(
			"useSelfViewSession must be used within SelfViewSessionProvider",
		);
	}

	return context;
}
