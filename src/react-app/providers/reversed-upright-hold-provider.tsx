import {
	createContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";

type ReversedUprightHoldContextValue = {
	held: boolean;
};

const ReversedUprightHoldContext =
	createContext<ReversedUprightHoldContextValue | null>(null);

export { ReversedUprightHoldContext };

function shouldIgnoreReversedUprightKey(event: KeyboardEvent): boolean {
	const target = event.target;
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;

	const tag = target.tagName;
	return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function ReversedUprightHoldProvider({ children }: { children: ReactNode }) {
	const [held, setHeld] = useState(false);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "r" && event.key !== "R") return;
			if (shouldIgnoreReversedUprightKey(event)) return;
			if (event.repeat) return;
			event.preventDefault();
			setHeld(true);
		};

		const onKeyUp = (event: KeyboardEvent) => {
			if (event.key !== "r" && event.key !== "R") return;
			setHeld(false);
		};

		const onWindowBlur = () => {
			setHeld(false);
		};

		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		window.addEventListener("blur", onWindowBlur);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
			window.removeEventListener("blur", onWindowBlur);
		};
	}, []);

	const value = useMemo(() => ({ held }), [held]);

	return (
		<ReversedUprightHoldContext.Provider value={value}>
			{children}
		</ReversedUprightHoldContext.Provider>
	);
}
