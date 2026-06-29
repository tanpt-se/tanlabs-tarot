import { useCallback, useState } from "react";
import { useBackgroundMusic } from "../../hooks/use-background-music";
import { useAppChromeShortcuts } from "../../hooks/use-app-chrome-shortcuts";
import { useLocale } from "../../hooks/use-locale";
import { HOME_LOGO } from "../../assets";
import { isGameModalOpen } from "../../lib/keyboard/app-shortcut";
import { AboutModal } from "../about/AboutModal";
import { ShopModal } from "../shop/ShopModal";
import { AboutIcon } from "../icons/AboutIcon";
import { CartIcon } from "../icons/CartIcon";
import { HelpIcon } from "../icons/HelpIcon";
import { SettingsMenuIcon } from "../icons/SettingsMenuIcon";
import { GameToast } from "../GameToast";
import { StaggerFadeIn } from "../motion/screen-motion";
import { GameMenu } from "../menu/GameMenu";
import { GameMenuItem } from "../menu/GameMenuItem";
import { HelpModal } from "../help/HelpModal";

interface HomeScreenProps {
	onSelfView: () => void;
	onGuidedReading: () => void;
	onOpenSettings: () => void;
	onCloseSettings: () => void;
	isSettingsOpen: boolean;
}

export function HomeScreen({
	onSelfView,
	onGuidedReading,
	onOpenSettings,
	onCloseSettings,
	isSettingsOpen,
}: HomeScreenProps) {
	const { labels } = useLocale();
	const { enabled: musicEnabled, toggle: toggleMusic } = useBackgroundMusic();
	const [aboutOpen, setAboutOpen] = useState(false);
	const [shopOpen, setShopOpen] = useState(false);
	const [helpOpen, setHelpOpen] = useState(false);
	const [muteToast, setMuteToast] = useState<{
		id: number;
		message: string;
	} | null>(null);

	const handleMuteHotkey = useCallback(() => {
		setMuteToast({
			id: Date.now(),
			message: musicEnabled
				? labels.musicMutedToast
				: labels.musicUnmutedToast,
		});
		toggleMusic();
	}, [
		labels.musicMutedToast,
		labels.musicUnmutedToast,
		musicEnabled,
		toggleMusic,
	]);

	const handleHelpHotkey = useCallback(() => {
		if (helpOpen) {
			setHelpOpen(false);
			return;
		}

		if (isGameModalOpen()) return;

		setHelpOpen(true);
	}, [helpOpen]);

	const handleSettingsHotkey = useCallback(() => {
		if (isSettingsOpen) {
			onCloseSettings();
			return;
		}

		if (isGameModalOpen()) return;

		onOpenSettings();
	}, [isSettingsOpen, onCloseSettings, onOpenSettings]);

	useAppChromeShortcuts({
		onHelp: handleHelpHotkey,
		onSettings: handleSettingsHotkey,
		onMute: handleMuteHotkey,
	});

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
									onClick={onGuidedReading}
								/>
								<GameMenuItem
									label={labels.homeSelfView}
									onClick={onSelfView}
								/>
								<div
									className="home-menu__extras"
									role="group"
									aria-label={labels.homeMoreLabel}
								>
									<GameMenuItem
										label={labels.homeShop}
										featured
										compact
										icon={<CartIcon className="game-button__icon" />}
										onClick={() => setShopOpen(true)}
									/>
									<GameMenuItem
										label={labels.homeSettings}
										featured
										compact
										icon={<SettingsMenuIcon />}
										onClick={onOpenSettings}
									/>
									<GameMenuItem
										label={labels.openHelp}
										featured
										compact
										icon={<HelpIcon />}
										onClick={() => setHelpOpen(true)}
									/>
									<GameMenuItem
										label={labels.homeAbout}
										featured
										compact
										icon={<AboutIcon />}
										onClick={() => setAboutOpen(true)}
									/>
								</div>
							</GameMenu>
						</div>
					</div>
				</StaggerFadeIn>
			</div>

			{aboutOpen ? <AboutModal onClose={() => setAboutOpen(false)} /> : null}
			{shopOpen ? <ShopModal onClose={() => setShopOpen(false)} /> : null}
			{helpOpen ? <HelpModal onClose={() => setHelpOpen(false)} /> : null}

			{muteToast ? (
				<GameToast
					key={muteToast.id}
					message={muteToast.message}
					dismissLabel={labels.dismissToast}
					onDismiss={() => setMuteToast(null)}
				/>
			) : null}
		</div>
	);
}
