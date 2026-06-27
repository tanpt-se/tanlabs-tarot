import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CloseButton } from "../CloseButton";
import { CartIcon } from "../icons/CartIcon";
import { GamePanel } from "../GamePanel";
import { useEscapeKey } from "../../hooks/use-escape-key";
import { useLocale } from "../../hooks/use-locale";

interface ShopModalProps {
	onClose: () => void;
}

export function ShopModal({ onClose }: ShopModalProps) {
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
				className="game-modal shop-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="shop-modal-title"
				tabIndex={-1}
				onClick={(event) => event.stopPropagation()}
			>
				<header className="shop-modal__header">
					<h2 id="shop-modal-title" className="shop-modal__title">
						{labels.shopTitle}
					</h2>
					<CloseButton onClick={onClose} aria-label={labels.closeShop} />
				</header>

				<div className="shop-modal__body">
					<div className="shop-modal__intro">
						<CartIcon className="shop-modal__icon" />
						<p className="shop-modal__text">{labels.comingSoon}</p>
					</div>
				</div>
			</GamePanel>
		</div>,
		document.body,
	);
}
