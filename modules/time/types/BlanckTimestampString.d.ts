/** String representing a date format with letters */
type BlanckDateString = `${string & { __brand: "" }}`;

/** String representing a time format with letters */
type BlanckTimeString = `${string & { __brand: "" }}`;

/** String representing a timestamp format with letters */
export type BlanckTimestampString =
	| `${BlanckDateString} ${BlanckTimeString}`
	| `${BlanckTimeString} ${BlanckDateString}`;
