declare global {
	/**
	 * Returns the current time as a formatted string
	 * @param date Whether to include the date
	 * @returns The current time as a formatted string
	 */
	function getTime(date?: boolean): `${string}:${string}:${string}${` ${string}.${string}.${string}` | ""}`;
}

global.getTime = function (
	date: boolean = false,
): `${string}:${string}:${string}${` ${string}.${string}.${string}` | ""}` {
	const now = new Date();
	const year = now.getFullYear();
	const month = (now.getMonth() + 1).toString().padStart(2, "0");
	const day = now.getDate().toString().padStart(2, "0");
	const hours = now.getHours().toString().padStart(2, "0");
	const minutes = now.getMinutes().toString().padStart(2, "0");
	const seconds = now.getSeconds().toString().padStart(2, "0");
	return `${hours}:${minutes}:${seconds}${date ? ` ${day}.${month}.${year}` : ""}`;
};

export {};
