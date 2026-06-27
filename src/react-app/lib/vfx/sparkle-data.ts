const SPARKLE_URL = "/vfx/sparkle-reveal.json";

let cachedSparkle: object | null = null;
let loadPromise: Promise<object> | null = null;

export function preloadSparkleAnimation(): void {
	if (typeof window === "undefined") return;
	void loadSparkleAnimation();
}

export async function loadSparkleAnimation(): Promise<object> {
	if (cachedSparkle) return cachedSparkle;

	loadPromise ??= fetch(SPARKLE_URL)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`Failed to load sparkle animation (${response.status})`);
			}
			return response.json() as Promise<object>;
		})
		.then((data) => {
			cachedSparkle = data;
			return data;
		})
		.finally(() => {
			loadPromise = null;
		});

	return loadPromise;
}
