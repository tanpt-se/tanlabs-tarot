import { EmptyHome } from "./components/chat/EmptyHome";
import { ChatView } from "./components/chat/ChatView";
import { useReadingHistory } from "./hooks/useReadingHistory";
import "./App.css";

function App() {
	const { readings, hasReadings, addQuestion, clearHistory } =
		useReadingHistory();

	return (
		<main className="app">
			{hasReadings ? (
				<ChatView
					readings={readings}
					onSubmit={addQuestion}
					onClearHistory={clearHistory}
				/>
			) : (
				<EmptyHome onSubmit={addQuestion} />
			)}
		</main>
	);
}

export default App;
