// External libraries imports
import { TimestampStyles, TimestampStylesString } from "discord.js";

// Internal class & type imports
import { Month, Weekday } from "./classes";
import { BlanckTimestampString, ISO8601FormatString, TimestampString } from "./types";

/**
 * Returns the current time formatted as `DD/MM/YYYY, hh:mm:ss`.
 * @returns The current tims as string
 */
export default function getTime(): string;

/**
 * Returns the current time, date or both formatted as `DD/MM/YYYY, hh:mm:ss`.
 * @param timeOnly - Whether to only return the time
 * @param dateOnly - Whether to only return the date
 *
 * **Requesting the time only will nullify the value of `dateOnly`!**
 */
export default function getTime(timeOnly?: boolean, dateOnly?: boolean): string;

/**
 * Returns the current time formatted as specified in
 * {@linkplain https://www.iso.org/iso-8601-date-and-time-format.html | ISO 8601}.
 * @returns The current time as string
 */
export default function getTime(format: ISO8601FormatString): `${number}`;

/**
 * Returns the current time formated as one of the
 * {@linkplain https://discord.com/developers/docs/reference#message-formatting-timestamp-styles | timestamp styles of Discord}.
 * @param format - One of the timestamp styles supported by Discord excluding relative time. Defaults to
 * {@linkcode TimestampStyles.LongDateShortTime}
 * @see {@linkcode TimestampStyles} | {@linkcode TimestampStylesString}
 */
export default function getTime(format: Exclude<TimestampStylesString, "R">): string;

export default function getTime(format: BlanckTimestampString): TimestampString;

export default function getTime(
	x?: boolean | BlanckTimestampString | Exclude<TimestampStylesString, "R"> | ISO8601FormatString,
	dateOnly?: boolean,
): string {
	/** Current date and time */
	const now = new Date();

	/** Overload format parameter */
	const format = typeof x === "boolean" ? undefined : x;

	/** Overload time only parameter */
	const timeOnly = typeof x === "boolean" ? x : undefined;

	if (format) {
		if (format.length > 0) {
			if (format.toUpperCase().match(/^(DD|HH|MM|SS|YYYY)([\/\-: ](DD|HH|MM|SS|YYYY))*$/)) {
				/** Format parameter with correct type */
				const blanckTimestamp = format.toUpperCase() as BlanckTimestampString;

				if (
					blanckTimestamp.indexOf("DD") !== blanckTimestamp.lastIndexOf("DD") ||
					blanckTimestamp.indexOf("HH") !== blanckTimestamp.lastIndexOf("HH") ||
					blanckTimestamp.indexOf("SS") !== blanckTimestamp.lastIndexOf("SS") ||
					blanckTimestamp.indexOf("YYYY") !== blanckTimestamp.lastIndexOf("YYYY")
				) {
					throw TypeError(`Time format '${blanckTimestamp}' cannot be resolved correctly`);
				}

				const m = blanckTimestamp.indexOf("MM");

				if (m > 0 && blanckTimestamp[m + 2] === "") {
				}

				return blanckTimestamp
					.replace("DD", now.getDate().toString().padStart(2, "0"))
					.replace("HH", now.getHours().toString().padStart(2, "0"))
					.replace("SS", now.getSeconds().toString().padStart(2, "0"))
					.replace("YYYY", now.getFullYear().toString().padStart(4, "0"));
			}

			/** Format parameter with correct type */
			const isoFormat = format as ISO8601FormatString;

			const iso = now.toISOString();

			if (isoFormat.includes("ordinal")) {
				iso.replace(/\d\d-\d\dT/, `-${"".padStart(3, "0")}T`);
			} else if (isoFormat.includes("week")) {
				iso.replace(/\d\d-\d\dT/, `-"${""}T`);
			}

			if (isoFormat.includes("date only")) {
				iso.replace(/T.*$/, "");
			} else if (isoFormat.includes("hours")) {
			} else if (isoFormat.includes("minutes")) {
			} else if (isoFormat.includes("seconds")) {
			} else if (isoFormat.includes("milliseconds")) {
			}

			if (isoFormat.includes("local offset")) {
				iso.replace("Z", `${now.getTimezoneOffset().toString()}`);
			}

			if (isoFormat.includes("basic")) {
				iso.replaceAll(/[:-]/, "");
			}
			return iso;
		}

		/** Format parameter with correct type */
		const discordFormat = format as Exclude<TimestampStylesString, "R">;

		switch (discordFormat) {
			case TimestampStyles.FullDateShortTime:
				return `${Weekday[(now.getDay() - 1) % 7]}, ${Month[now.getMonth()]} ${now
					.getDate()
					.toString()
					.padStart(2, "0")}, ${now.getFullYear().toString().padStart(4, "0")} at ${now
					.getHours()
					.toString()
					.padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

			case TimestampStyles.LongDate:
				return `${Month[now.getMonth()]} ${now.getDate().toString().padStart(2, "0")}, ${now
					.getFullYear()
					.toString()
					.padStart(4, "0")}`;

			case TimestampStyles.LongDateShortTime:
				return `${Month[now.getMonth()]} ${now.getDate().toString().padStart(2, "0")}, ${now
					.getFullYear()
					.toString()
					.padStart(4, "0")} at ${now.getHours().toString().padStart(2, "0")}:${now
					.getMinutes()
					.toString()
					.padStart(2, "0")}`;

			case TimestampStyles.MediumTime:
				return `${now.getHours().toString().padStart(2, "0")}:${now
					.getMinutes()
					.toString()
					.padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

			case TimestampStyles.ShortDate:
				return `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
					.toString()
					.padStart(2, "0")}/${now.getFullYear().toString().padStart(4, "0")}`;

			case TimestampStyles.ShortDateMediumTime:
				return `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
					.toString()
					.padStart(2, "0")}/${now.getFullYear().toString().padStart(4, "0")}, ${now
					.getHours()
					.toString()
					.padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
					.getSeconds()
					.toString()
					.padStart(2, "0")}`;

			case TimestampStyles.ShortDateShortTime:

			case TimestampStyles.ShortTime:
				return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

			default:
				return `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
					.toString()
					.padStart(2, "0")}/${now.getFullYear().toString().padStart(4, "0")}, ${now
					.getHours()
					.toString()
					.padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
		}
	}

	if (timeOnly) {
		return now.toLocaleTimeString();
	}

	if (dateOnly) {
		return now.toLocaleDateString();
	}

	return now.toLocaleString();
}
