interface GuidedUserBubbleProps {
	message: string;
}

export function GuidedUserBubble({ message }: GuidedUserBubbleProps) {
	return (
		<div className="guided-user-bubble" aria-label={message}>
			<div className="guided-user-bubble__panel">
				<span className="guided-user-bubble__shine" aria-hidden />
				<p className="guided-user-bubble__text">{message}</p>
			</div>
		</div>
	);
}
