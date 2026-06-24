interface QuestionBarProps {
	label: string;
	question: string;
}

export function QuestionBar({ label, question }: QuestionBarProps) {
	return (
		<div className="spread-screen__question">
			<span className="game-button__frame spread-screen__question-inner">
				<span className="spread-screen__question-label">{label}:</span>
				<span className="spread-screen__question-text" title={question}>
					{question}
				</span>
			</span>
		</div>
	);
}
