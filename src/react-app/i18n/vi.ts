import type { UiLabels } from "./types";

export const vi: UiLabels = {
	appName: "Tanlabs Tarot",
	cardBackAlt: "Mặt sau lá bài",
	homeDescription:
		"Đặt câu hỏi, rút bài và nhận lời giải từ những lá bài tarot. Mỗi lần trải bài sẽ được lưu lại để bạn xem lại bất cứ lúc nào.",
	homePlaceholder: "Bạn muốn hỏi điều gì?",
	homeStartReading: "Bắt đầu trải bài",
	homeHistoryTitle: "Hành trình",
	homeJournal: (count) =>
		count === 1 ? "Nhật ký · 1 lần" : `Nhật ký · ${count} lần`,
	homeJournalClose: "Đóng nhật ký",
	homeViewReading: "Xem lại",
	chatPlaceholder: "Hỏi thêm một câu hỏi mới...",
	clearHistory: "Xóa lịch sử",
	sendQuestion: "Gửi câu hỏi",
	readingLabel: "Lần trải bài",
	statusPending: "Đang chờ trải bài...",
	statusDrawing: "Đang rút bài...",
	statusInterpreting: "Đang giải bài...",
	statusComplete: "Đã hoàn thành",
	cardsDrawn: (count) => `${count} lá bài đã rút`,
	noCardsYet: "Chưa có lá bài — sẽ bổ sung ở bước trải bài",
	musicOn: "Bật nhạc nền",
	musicOff: "Tắt nhạc nền",
	musicLabel: "Nhạc nền",
	volumeLabel: "Âm lượng",
	language: "Ngôn ngữ",
	localeEn: "English",
	localeVi: "Tiếng Việt",
	openSettings: "Cài đặt",
	closeSettings: "Đóng cài đặt",
	loading: "Đang tải",
	settingsTitle: "Cài đặt",
	settingsTabLanguage: "Ngôn ngữ",
	settingsTabMode: "Chế độ",
	settingsTabSound: "Âm thanh",
	settingsTabAbout: "Thông tin",
	settingsAboutDescription:
		"Tanlabs Tarot là trải nghiệm trải bài tarot theo nhịp game — trộn bài, rút bài, lật bài và suy ngẫm.",
	settingsAboutDisclaimer:
		"Tarot chỉ mang tính tham khảo và giải trí. Không thay thế tư vấn chuyên môn.",
	settingsVersion: "Phiên bản 0.1",
	selfViewMode: "Tôi là Tarot Reader",
	selfViewModeDesc:
		"Chỉ trải bài — không có narrator, câu hỏi hay lời giải.",
	selfViewModeOn: "Đang bật tự xem",
	selfViewModeOff: "Đang tắt tự xem",
	selfViewDrawOne: "Rút một lá",
	selfViewShuffleDeck: "Trộn bộ bài",
	selfViewSpreadEmpty: "Lá bài rút ra sẽ hiện ở đây",
	selfViewCardsLeft: (count) =>
		count === 1 ? "Còn 1 lá" : `Còn ${count} lá`,
	selfViewReset: "Reset",
	selfViewResetTitle: "Trải bài mới?",
	selfViewResetMessage:
		"Lần trải hiện tại sẽ được lưu vào lịch sử. Bạn có muốn bắt đầu lại từ đầu?",
	selfViewResetConfirm: "Có, trải lại",
	selfViewResetCancel: "Không, quay lại",
	selfViewExitTitle: "Thoát chế độ tự trải?",
	selfViewExitMessage:
		"Lần trải hiện tại sẽ được lưu vào lịch sử trước khi quay về chế độ có người dẫn.",
	selfViewExitConfirm: "Có, thoát",
	selfViewExitCancel: "Không, ở lại",
	selfViewHistoryTitle: "Lần trải trước",
	selfViewHistoryEntry: (count) =>
		count === 1 ? "Trải 1 lá" : `Trải ${count} lá`,
	selfViewHistoryClose: "Đóng lần trải trước",
	selfViewBackToCurrent: "Về lần hiện tại (Esc)",
	selfViewHistoryEmpty: "Lần trải này không có lá bài",
	spreadBack: "Quay lại",
	spreadYourQuestion: "Câu hỏi của bạn",
	spreadAskQuestion: "Bạn muốn hỏi điều gì?",
	spreadChooseType: "Chọn kiểu trải bài",
	spreadSingle: "1 lá",
	spreadSingleDesc: "Một lá cho câu trả lời tập trung",
	spreadThree: "3 lá",
	spreadThreeDesc: "Quá khứ, hiện tại và tương lai",
	spreadSix: "6 lá chuyên sâu",
	spreadSixDesc: "Trải sâu qua sáu vị trí",
	spreadShuffleNarration:
		"Bạn trộn bộ bài. Những lá bài thì thầm trong ánh nến...",
	spreadReady: "Tôi đã sẵn sàng",
	spreadShuffling: "Đang trộn...",
	spreadReveal: "Lật bài",
	spreadConceal: "Úp bài",
	spreadRevealAll: "Lật tất cả",
	spreadSummary: "Tổng hợp",
	spreadReading: "Giải bài",
	spreadComplete: "Hoàn thành trải bài",
	spreadNewReading: "Trải bài mới",
	spreadGoHome: "Về trang chủ",
	spreadPositionPast: "Quá khứ",
	spreadPositionPresent: "Hiện tại",
	spreadPositionFuture: "Tương lai",
	spreadPositionChallenge: "Thách thức",
	spreadPositionAdvice: "Lời khuyên",
	spreadPositionOutcome: "Kết quả",
	spreadPositionSingle: "Lá bài của bạn",
	spreadCardReversed: "Ngược",
	spreadCardUpright: "Thuận",
	spreadDealingCards: (dealt, total) =>
		dealt === 0
			? `Đang bốc ${total} lá bài...`
			: `Đang bốc bài... ${dealt}/${total}`,
	narratorName: "Người Đọc Bí Ẩn",
	narratorAlt: "Cô gái trùm mũ bí ẩn dẫn trải bài tarot",
	narratorSkip: "[ >> bỏ qua ]",
	narratorSkipLabel: "bỏ qua",
	narratorHomeGreeting:
		"Chào người tìm đáp án. Hãy thì thầm câu hỏi của bạn — ta sẽ dẫn ngươi qua nghi thức trải bài.",
	narratorSpreadQuestion:
		"Hãy thì thầm câu hỏi của ngươi. Những lá bài đang lắng nghe.\n\nVí dụ: Tình yêu của tôi sắp tới sẽ thế nào?",
	narratorSpreadSetup:
		"Hãy chọn độ sâu — một lá, ba lá, hay sáu lá chuyên sâu.",
	narratorSpreadShuffle:
		"Lắng nghe… bộ bài đang thức dậy. Khi ngươi sẵn sàng, ta sẽ bốc bài.",
	narratorSpreadDrawing:
		"Bộ bài đang tự chọn cho ngươi. Hãy nhìn các lá rơi xuống đúng chỗ.",
	narratorSpreadReveal:
		"Lật từng lá bằng cách chạm vào. Khi đủ lá, hãy nhấn Tổng hợp.",
	narratorSpreadInterpret:
		"Mọi lá đã mở. Nhấn Tổng hợp khi ngươi sẵn sàng nghe lời giải đầy đủ.",
	narratorSpreadComplete:
		"Tấm màn buông xuống tạm thời. Mang theo điều ngươi đã ngộ ra vào thế giới thực.",
};
