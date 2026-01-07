/** String representing a date */
type DateString = `${string & { __brand: "" }}`;

/** String representing a time */
type TimeString = `${string & { __brand: "" }}`;

/** String representing a timestamp */
export type TimestampString = `${DateString} ${TimeString}` | `${TimeString} ${DateString}`;
