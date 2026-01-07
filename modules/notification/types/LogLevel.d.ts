/**
 * Level of a log message. This can be used to determine, which messages are sent to the bot owner(s). In case of a team
 * owning the bot, team members can exclude themself from message by setting a minimal level to receive.
 *
 * Recommended use:
 * - `0`: debugging uses only
 * - `1`: informational messages
 * - `2`: messages of success
 * - `3`: warnings
 * - `4`: light errors
 * - `5`: heavy errors
 * - `6`: startup / shutdown & more important events
 */
export type LogLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;
