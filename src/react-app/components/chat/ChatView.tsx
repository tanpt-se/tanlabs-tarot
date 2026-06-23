import { useEffect, useRef } from "react";
import type { Reading } from "../../lib/types/reading";
import { BrandLogo } from "../brand/BrandLogo";
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
					<BrandLogo size="sm" />
					<span>Tanlabs Tarot</span>
				</div>
				<button
					className="chat-view__clear"
					type="button"
					onClick={onClearHistory}
				>
					Xóa lịch sử
				</button>
			</header>

			<div className="chat-view__messages" ref={scrollRef}>
				{readings.map((reading) => (
					<ReadingBubble key={reading.id} reading={reading} />
				))}
			</div>

			<div className="chat-view__composer">
				<ChatInput
					onSubmit={onSubmit}
					placeholder="Hỏi thêm một câu hỏi mới..."
				/>
			</div>
		</div>
	);
}
