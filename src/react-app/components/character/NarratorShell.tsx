import { useCallback, useRef, useState, type ReactNode } from "react";
import type { NarratorAdvanceConfig } from "../../lib/types/narrator-advance";
import type { NarratorChoicesConfig } from "../../lib/types/narrator-choice";
import { NarratorAdvanceButton } from "./NarratorAdvanceButton";
import { NarratorBar } from "./NarratorBar";
import { NarratorChoiceList } from "./NarratorChoiceList";

interface NarratorShellProps {
	message?: string;
	input?: ReactNode;
	advance?: NarratorAdvanceConfig;
	choices?: NarratorChoicesConfig;
}

export function NarratorShell({
	message,
	input,
	advance,
	choices,
}: NarratorShellProps) {
	const [typing, setTyping] = useState(false);
	const advanceInvokeRef = useRef<(() => void) | null>(null);
	advanceInvokeRef.current = advance?.onAdvance ?? null;

	const handleAdvance = useCallback(() => {
		advanceInvokeRef.current?.();
	}, []);

	if (!message && !input) return null;

	const advanceDisabled =
		advance?.disabled ||
		(advance?.blockWhileTyping !== false && typing);

	return (
		<div
			className="guided-narrator"
			data-active="true"
			data-choices={choices ? "true" : undefined}
			data-input={input ? "true" : undefined}
		>
			<NarratorBar
				message={message ?? ""}
				input={input}
				choices={
					choices ? (
						<NarratorChoiceList
							options={choices.options}
							disabled={typing}
						/>
					) : undefined
				}
				advance={
					advance ? (
						<NarratorAdvanceButton
							onClick={handleAdvance}
							label={advance.label}
							disabled={advanceDisabled}
							layout={advance.layout}
							showIcon={advance.showIcon}
						/>
					) : undefined
				}
				onTypingChange={setTyping}
			/>
		</div>
	);
}
