import { useEffect, useRef } from "react";
import type { Reading } from "../../lib/types/reading";
import { LocaleSwitcher } from "../LocaleSwitcher";
import { BrandLogo } from "../brand/BrandLogo";
import { GameButton } from "../GameButton";
import { useLocale } from "../../hooks/use-locale";
import { ChatInput } from "./ChatInput";
import { ReadingBubble } from "./ReadingBubble";

interface ChatViewProps {
	readings: Reading[];
	onSubmit: (question: string) => void;
	onClearHistory: () => void;
}

export function ChatView({
	readings,
	onSubmit,
	onClearHistory,
}: ChatViewProps) {
	const { labels } = useLocale();
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const node = scrollRef.current;
		if (!node) return;
		node.scrollTop = node.scrollHeight;
	}, [readings]);

	return (
		<div className="chat-view">
			<header className="chat-view__header">
				<div className="chat-view__brand">
					<BrandLogo size="sm" alt={labels.appName} />
					<span>{labels.appName}</span>
				</div>
				<div className="chat-view__actions">
					<LocaleSwitcher />
					<GameButton
						tone="secondary"
						layout="text"
						onClick={onClearHistory}
					>
						{labels.clearHistory}
					</GameButton>
				</div>
			</header>

			<div className="chat-view__messages" ref={scrollRef}>
				{readings.map((reading) => (
					<ReadingBubble key={reading.id} reading={reading} />
				))}
			</div>

			<div className="chat-view__composer">
				<ChatInput
					onSubmit={onSubmit}
					placeholder={labels.chatPlaceholder}
					sendLabel={labels.sendQuestion}
				/>
			</div>
		</div>
	);
}
