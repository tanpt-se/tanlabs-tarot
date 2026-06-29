import { motion } from "framer-motion";
import { useLocale } from "../../hooks/use-locale";
import { getCardKeywords } from "../../lib/tarot/card-keywords";
import {
	getCardMeaning,
	getCardName,
} from "../../lib/tarot/card-text";
import { getCardImageUrl } from "../../lib/tarot/card-image";
import type { CardId } from "../../lib/tarot/deck";
import type { DrawnCard } from "../../lib/types/reading";
import { GameButton } from "../GameButton";
import { GamePanel } from "../GamePanel";
import { motionSpring } from "../motion/screen-motion";

interface ReadingPanelProps {
	card: DrawnCard;
	positionLabel: string;
	question: string;
	onNext?: () => void;
	nextLabel?: string;
	hideFooter?: boolean;
	highlightOrientation?: boolean;
}

export function ReadingPanel({
	card,
	positionLabel,
	question,
	onNext,
	nextLabel,
	hideFooter = false,
	highlightOrientation = false,
}: ReadingPanelProps) {
	const { labels, locale } = useLocale();
	const name = getCardName(card.id, locale);
	const meaning = getCardMeaning(card.id, card.reversed, locale);
	const keywords = getCardKeywords(card.id, card.reversed, locale);
	const orientation = card.reversed
		? labels.spreadCardReversed
		: labels.spreadCardUpright;
	const imageUrl = getCardImageUrl(card.id as CardId);

	const questionLink =
		locale === "vi"
			? `Với câu hỏi "${question}", ${name} gợi ý bạn suy ngẫm về: ${meaning}`
			: `Regarding "${question}", ${name} invites you to reflect on: ${meaning}`;

	const dailyReflection =
		locale === "vi"
			? `${name} gợi ý cho ngày hôm nay: ${meaning}`
			: `For today, ${name} invites you to reflect on: ${meaning}`;

	const showQuestionLink = question.trim().length > 0;

	return (
		<motion.div
			className="reading-panel-wrap"
			key={`${card.id}-${positionLabel}`}
			initial={{ opacity: 0, y: 16, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={motionSpring}
		>
			<GamePanel className="reading-panel" surfaceClassName="reading-panel__surface">
			<header className="reading-panel__header">
				<div className="reading-panel__position">{positionLabel}</div>
				<h2 className="reading-panel__title">
					<svg
						className="reading-panel__star"
						width={18}
						height={18}
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						aria-hidden
					>
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
					</svg>
					{name}
				</h2>
				<p
					className={`reading-panel__orientation${highlightOrientation ? " reading-panel__orientation--daily" : ""}`}
				>
					{orientation}
				</p>
			</header>

			<div className="reading-panel__body">
				<div className="reading-panel__art">
					<img src={imageUrl} alt={name} className="reading-panel__image" />
				</div>

				<div className="reading-panel__content">
					{highlightOrientation ? (
						<section className="reading-panel__section">
							<h3 className="reading-panel__section-title">
								{labels.dailyCardOrientation}
							</h3>
							<p className="reading-panel__text reading-panel__text--orientation">
								{orientation}
							</p>
						</section>
					) : null}
					<section className="reading-panel__section">
						<h3 className="reading-panel__section-title">
							{labels.readingPanelKeywords}
						</h3>
						<ul className="reading-panel__keywords">
							{keywords.map((keyword) => (
								<li key={keyword} className="reading-panel__keyword">
									{keyword}
								</li>
							))}
						</ul>
					</section>

					<section className="reading-panel__section">
						<h3 className="reading-panel__section-title">
							{labels.readingPanelMeaning}
						</h3>
						<p className="reading-panel__text">{meaning}</p>
					</section>

					<section className="reading-panel__section">
						<h3 className="reading-panel__section-title">
							{showQuestionLink
								? labels.readingPanelQuestion
								: labels.readingPanelDaily}
						</h3>
						<p className="reading-panel__text">
							{showQuestionLink ? questionLink : dailyReflection}
						</p>
					</section>
				</div>
			</div>

			{hideFooter ? null : (
				<footer className="reading-panel__footer">
					<GameButton
						tone="light"
						layout="stack"
						code={positionLabel.replace(/\D/g, "") || undefined}
						sublabel={labels.buttonEnscribe}
						onClick={onNext}
					>
						{nextLabel}
					</GameButton>
				</footer>
			)}
			</GamePanel>
		</motion.div>
	);
}
