import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CloseButton } from "../CloseButton";
import { GamePanel } from "../GamePanel";
import { useEscapeKey } from "../../hooks/use-escape-key";
import { useLocale } from "../../hooks/use-locale";
import { HOME_LOGO } from "../../assets";
import {
	ABOUT_CREATOR_FACEBOOK_URL,
	ABOUT_CREATOR_LINKEDIN_URL,
	ABOUT_CREATOR_PHONE_DISPLAY,
	ABOUT_CREATOR_PHONE_HREF,
} from "../../lib/about/creator-links";
import { APP_VERSION } from "../../lib/app-version";

interface AboutModalProps {
	onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
	const { labels } = useLocale();
	const dialogRef = useRef<HTMLDivElement>(null);

	useEscapeKey(onClose);

	useEffect(() => {
		dialogRef.current?.focus();
	}, []);

	return createPortal(
		<div className="game-modal-overlay" role="presentation" onClick={onClose}>
			<GamePanel
				ref={dialogRef}
				className="game-modal about-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="about-modal-title"
				tabIndex={-1}
				onClick={(event) => event.stopPropagation()}
			>
				<header className="about-modal__header">
					<h2 id="about-modal-title" className="about-modal__title">
						{labels.aboutTitle}
					</h2>
					<CloseButton onClick={onClose} aria-label={labels.closeAbout} />
				</header>

				<div className="about-modal__body">
					<div className="about-modal__intro">
						<img
							className="about-modal__logo"
							src={HOME_LOGO}
							alt={labels.appName}
							width={600}
							height={416}
							decoding="async"
						/>
						<p className="about-modal__text">{labels.aboutDescription}</p>
						<p className="about-modal__text about-modal__text--muted">
							{labels.aboutDisclaimer}
						</p>
						<p className="about-modal__version">
							{labels.aboutVersionLabel} {APP_VERSION}
						</p>
					</div>

					<section
						className="about-modal__creator"
						aria-labelledby="about-creator-title"
					>
						<h3 id="about-creator-title" className="about-modal__section-title">
							{labels.aboutCreatorTitle}
						</h3>
						<div className="about-modal__creator-bio">
							{labels.aboutCreatorBio.map((paragraph) => (
								<p key={paragraph} className="about-modal__text">
									{paragraph}
								</p>
							))}
						</div>
						<ul className="about-modal__links">
							<li>
								<a
									className="about-modal__link"
									href={ABOUT_CREATOR_LINKEDIN_URL}
									target="_blank"
									rel="noopener noreferrer"
								>
									{labels.aboutLinkedInLabel}
								</a>
							</li>
							<li>
								<a
									className="about-modal__link"
									href={ABOUT_CREATOR_FACEBOOK_URL}
									target="_blank"
									rel="noopener noreferrer"
								>
									{labels.aboutFacebookLabel}
								</a>
							</li>
							<li>
								<a className="about-modal__link" href={ABOUT_CREATOR_PHONE_HREF}>
									{labels.aboutPhoneLabel}: {ABOUT_CREATOR_PHONE_DISPLAY}
								</a>
							</li>
						</ul>
					</section>

					<section className="about-modal__updates" aria-labelledby="about-whats-new">
						<h3 id="about-whats-new" className="about-modal__section-title">
							{labels.aboutWhatsNew}
						</h3>
						<ul className="about-modal__updates-list">
							{labels.aboutUpdateNotes.map((note) => (
								<li key={note} className="about-modal__updates-item">
									{note}
								</li>
							))}
						</ul>
					</section>
				</div>
			</GamePanel>
		</div>,
		document.body,
	);
}
