import { useContext } from "react";
import { ReversedUprightHoldContext } from "../providers/reversed-upright-hold-provider";

export function useReversedUprightHold() {
	const context = useContext(ReversedUprightHoldContext);
	if (!context) {
		throw new Error(
			"useReversedUprightHold must be used within ReversedUprightHoldProvider",
		);
	}

	return context;
}
