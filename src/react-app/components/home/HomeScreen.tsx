import { useLocale } from "../../hooks/use-locale";
import { HOME_LOGO } from "../../assets";
import { GUIDED_READING_ENABLED } from "../../lib/features/guided-reading";
import { StaggerFadeIn } from "../motion/screen-motion";
import { GameMenu } from "../menu/GameMenu";
import { GameMenuItem } from "../menu/GameMenuItem";

interface HomeScreenProps {
	onSelfView: () => void;
	onGuidedReading: () => void;
	onOpenSettings: () => void;
}

export function HomeScreen({
	onSelfView,
	onGuidedReading,
	onOpenSettings,
}: HomeScreenProps) {
	const { labels } = useLocale();

	return (
		<div className="home-pov-scene">
			<div className="home-pov-scene__playfield">
				<StaggerFadeIn delay={0.12}>
					<div className="home-pov-scene__hero">
						<header className="home-game-title">
							<img
								className="home-game-title__logo"
								src={HOME_LOGO}
								alt={labels.appName}
								width={600}
								height={416}
								decoding="async"
							/>
						</header>

						<div className="home-menu-panels">
							<GameMenu variant="primary" aria-label={labels.homeNavLabel}>
								<GameMenuItem
									label={labels.homeAiReader}
									disabled={!GUIDED_READING_ENABLED}
									title={
										GUIDED_READING_ENABLED ? undefined : labels.homeDailySoon
									}
									onClick={onGuidedReading}
								/>
								<GameMenuItem
									label={labels.homeDailyCard}
									featured
									disabled
									title={labels.homeDailySoon}
								/>
								<GameMenuItem
									label={labels.homeSelfView}
									featured
									onClick={onSelfView}
								/>
								<GameMenuItem
									label={labels.openSettings}
									featured
									onClick={onOpenSettings}
								/>
							</GameMenu>
						</div>
					</div>
				</StaggerFadeIn>
			</div>
		</div>
	);
}
