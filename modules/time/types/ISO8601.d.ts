type ISO8601DateFormat = `${"calendar" | "ordinal" | "week"}`;
type ISO8601TimePrecision = `${"date only" | "hours" | "minutes" | "seconds" | "milliseconds"}`;
type ISO8601Timezone = `${"utc" | "local offset" | "no timezone"}`;
type ISO8601SeperatorStyle = `${"basic" | "extended"}`;

export type ISO8601FormatString =
	`${ISO8601DateFormat} ${ISO8601TimePrecision} ${ISO8601Timezone} ${ISO8601SeperatorStyle}`;
