import { useCallback, useRef, useState } from "react";
import type { NarratorAdvanceConfig } from "../../lib/types/narrator-advance";
import type { NarratorChoicesConfig } from "../../lib/types/narrator-choice";
import { NarratorAdvanceButton } from "./NarratorAdvanceButton";
import { NarratorBar } from "./NarratorBar";
import { NarratorChoiceList } from "./NarratorChoiceList";
import { NarratorSkipButton } from "./NarratorSkipButton";

interface NarratorShellProps {
	message?: string;
	advance?: NarratorAdvanceConfig;
	choices?: NarratorChoicesConfig;
}

export function NarratorShell({ message, advance, choices }: NarratorShellProps) {
	const [typing, setTyping] = useState(false);
	const [skip, setSkip] = useState<(() => void) | null>(null);
	const advanceInvokeRef = useRef<(() => void) | null>(null);
	advanceInvokeRef.current = advance?.onAdvance ?? null;

	const handleAdvance = useCallback(() => {
		advanceInvokeRef.current?.();
	}, []);

	if (!message) return null;

	const advanceDisabled =
		advance?.disabled ||
		(advance?.blockWhileTyping !== false && typing);

	return (
		<div
			className="narrator-shell"
			data-active="true"
			data-choices={choices ? "true" : undefined}
		>
			<NarratorBar
				message={message}
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
				onSkipChange={setSkip}
			/>
			{skip ? <NarratorSkipButton onClick={skip} /> : null}
		</div>
	);
}
