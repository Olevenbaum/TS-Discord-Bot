declare global {
	/**
	 * Returns the current time as a formatted string
	 * @param date Whether to include the date
	 * @returns The current time as a formatted string
	 */
	function getTime(date?: boolean): `${string}:${string}:${string}${` ${string}.${string}.${string}` | ""}`;
}

global.getTime = function (date: boolean = false) {
	/** Current date and time */
	const now = new Date();

	/** Year */
	const year = now.getFullYear();

	/** Month */
	const month = (now.getMonth() + 1).toString().padStart(2, "0");

	/** Day */
	const day = now.getDate().toString().padStart(2, "0");

	/** Hours */
	const hours = now.getHours().toString().padStart(2, "0");

	/** Minutes */
	const minutes = now.getMinutes().toString().padStart(2, "0");

	/** Seconds */
	const seconds = now.getSeconds().toString().padStart(2, "0");

	return `${hours}:${minutes}:${seconds}${date ? ` ${day}.${month}.${year}` : ""}`;
};

export {};
