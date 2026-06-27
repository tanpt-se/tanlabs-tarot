import { GamePanel } from "./GamePanel";

interface QuestionBarProps {
	label: string;
	question: string;
}

export function QuestionBar({ label, question }: QuestionBarProps) {
	return (
		<GamePanel
			className="spread-screen__question"
			surfaceClassName="spread-screen__question-inner"
		>
			<span className="spread-screen__question-label">{label}:</span>
			<span className="spread-screen__question-text" title={question}>
				{question}
			</span>
		</GamePanel>
	);
}
