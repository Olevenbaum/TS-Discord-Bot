// External libraries imports
import { Collection, InteractionType, type Snowflake } from "discord.js";

/**
 * Represents active cooldowns for a specific interaction type, tracking when users or servers can next interact.
 * Cooldowns prevent spam and abuse by enforcing time delays between interactions.
 */
interface CooldownCollections {
	/**
	 * Collection of cooldown timestamps for servers, keyed by server (guild) ID. Tracks when each server can next
	 * trigger this interaction type.
	 * @see {@linkcode Collection}
	 * @see {@linkcode Snowflake}
	 */
	servers?: Collection<Snowflake, Date>;

	/**
	 * Collection of cooldown timestamps for users, keyed by user ID. Tracks when each user can next trigger this
	 * interaction type.
	 * @see {@linkcode Collection}
	 * @see {@linkcode Snowflake}
	 */
	users?: Collection<Snowflake, Date>;
}

/**
 * Defines cooldown durations for interactable elements to prevent spam or abuse. Cooldowns can be set globally per
 * server or individually per user, with durations specified in seconds.
 */
interface CooldownObject {
	/**
	 * The cooldown duration in seconds that applies to all users within the same server. Users must wait this long
	 * before interacting with the element again on the same server.
	 */
	servers?: number;

	/**
	 * The cooldown duration in seconds that applies to individual users across all servers. A user must wait this
	 * long before interacting with the element again, regardless of server.
	 */
	users?: number;
}

/**
 * A comprehensive collection of cooldown states for all interaction types, organized by interaction type. This tracks
 * active cooldowns across different types of Discord interactions to manage rate limiting.
 * @see {@linkcode Collection}
 * @see {@linkcode CooldownCollections}
 * @see {@linkcode InteractionType}
 */
type Cooldowns = Record<keyof typeof InteractionType, Collection<string, CooldownCollections>>;

/**
 * Importance of a notification.
 * Interally, following system is used:
 * - **5**: Critical messages like crashes or bot startup/shutdown
 * - **4**: Major errors (not finding modules/files)
 * - **3**: Regular messages like minor errors (failed interactions, invalid inputs)
 * - **2**: Messages like successful actions
 * - **1**: Informational messages like logs and debug information
 * - **0**: Test messages
 *
 * **Note**:
 *
 * **Recommendation**: Consider following the system above for a consistent notification system.
 */
type NotificationImportance = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Represents the different categories of notifications that can be sent by the bot. Each type corresponds to a
 * specific kind of event or status message, allowing for appropriate filtering and presentation.
 */
type NotificationType = "ERROR" | "INFO" | "SUCCESS" | "TEST" | "WARNING";

/**
 * Nested array with unknown depth. Used for representing hierarchical data structures where arrays can contain
 * other arrays of the same type.
 */
type NestedArray<Type> = Array<Type | NestedArray<Type>>;

/**
 * Task that can be called to perform a promise based action. Represents a function that returns a promise,
 * commonly used for asynchronous operations that can be scheduled or executed later.
 */
type Task<ReturnType> = () => Promise<ReturnType>;
