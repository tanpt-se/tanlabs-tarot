import { useId } from "react";
import { CloseButton } from "../CloseButton";
import { CartIcon } from "../icons/CartIcon";
import { useEscapeKey } from "../../hooks/use-escape-key";
import { useLocale } from "../../hooks/use-locale";
import { GameModalFrame } from "../modals/GameModalFrame";

interface ShopModalProps {
	onClose: () => void;
}

export function ShopModal({ onClose }: ShopModalProps) {
	const { labels } = useLocale();
	const titleId = useId();

	useEscapeKey(onClose);

	return (
		<GameModalFrame
			onClose={onClose}
			panelClassName="shop-modal"
			panelProps={{ "aria-labelledby": titleId }}
		>
			<header className="shop-modal__header">
				<h2 id={titleId} className="shop-modal__title">
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
		</GameModalFrame>
	);
}
