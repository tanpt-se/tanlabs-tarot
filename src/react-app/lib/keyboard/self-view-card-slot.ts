export function parseSelfViewCardSlotKey(key: string): number | null {
	if (key >= "1" && key <= "9") return Number(key) - 1;
	if (key === "0") return 9;
	return null;
}
