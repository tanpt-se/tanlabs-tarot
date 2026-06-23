import { BrandLogo } from "../brand/BrandLogo";
import { CardBack } from "../brand/CardBack";
import { ChatInput } from "./ChatInput";

interface EmptyHomeProps {
	onSubmit: (question: string) => void;
}

export function EmptyHome({ onSubmit }: EmptyHomeProps) {
	return (
		<div className="empty-home">
			<div className="empty-home__hero">
				<CardBack size="hero" />
				<div className="empty-home__brand">
					<BrandLogo size="md" />
					<h1 className="empty-home__title">Tanlabs Tarot</h1>
				</div>
				<p className="empty-home__description">
					Đặt câu hỏi, rút bài và nhận lời giải từ những lá bài tarot. Mỗi
					lần trải bài sẽ được lưu lại để bạn xem lại bất cứ lúc nào.
				</p>
			</div>

			<div className="empty-home__input">
				<ChatInput
					onSubmit={onSubmit}
					placeholder="Bạn muốn hỏi điều gì?"
					autoFocus
				/>
				<p className="empty-home__hint">
					Ví dụ: Tình yêu của tôi sắp tới sẽ thế nào?
				</p>
			</div>
		</div>
	);
}
