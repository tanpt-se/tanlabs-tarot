/** Maps 1–9 and 0 (10th card) to zero-based spread index. */
export function parseSelfViewCardSlotKey(key: string): number | null {
	if (key >= "1" && key <= "9") return Number(key) - 1;
	if (key === "0") return 9;
	return null;
}
