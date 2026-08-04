// External libraries imports
import { StyledText } from "@opentui/core";

// Internal module imports
import type { Tag } from "./Tag";

// Module imports
import { LogType } from "#modules/notification";

/**
 * A log entry in a standardized form enabling filtering by {@linkcode type} and {@linkcode timestamp | date}.
 * {@linkcode tags} can be used to filter by origin, purpose or similar properties of the message, when provided.
 */
export interface LogEntry {
	/**
	 * Content of the log entry.
	 * @see {@linkcode StyledText}
	 */
	content: StyledText;

	/**
	 * Tags describing the origin and purpose of the log entry. Can be used for filtering.
	 * @see {@linkcode Tag}
	 */
	tags?: Tag[];

	/** Timestamp of the log entries creation. Can be used for filtering. */
	timestamp: Date;

	/**
	 * Type of the log entry. Can be used for filtering.
	 * @see {@linkcode LogEntry}
	 */
	type: LogType;
}
