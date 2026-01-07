// Type imports
import { Collection, InteractionType, Snowflake } from "discord.js";

/** Active cooldowns for any specific interaction type */
interface CooldownCollections {
	/**
	 * Collection of cooldowns for servers
	 * @see {@link Collection} | {@link Date} | {@link Snowflake}
	 */
	servers?: Collection<Snowflake, Date>;

	/**
	 * Collection of cooldowns for users
	 * @see {@link Collection} | {@link Date} | {@link Snowflake}
	 */
	users?: Collection<Snowflake, Date>;
}

/** Cooldowns for interacting with the interactable element */
interface CooldownObject {
	/** The time any user has to wait to interact with this interactable element again on a the same server */
	servers?: number;

	/** The time the same user has to wait to interact with this interactable element again */
	users?: number;
}

/**
 * Cooldown collection for all interaction types
 * @see {@link Collection} | {@link CooldownCollections} | {@link InteractionType}
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

/** Type of notifications */
type NotificationType = "ERROR" | "INFO" | "SUCCESS" | "TEST" | "WARNING";

/** Nested array with unknown depth */
type NestedArray<Type> = Array<Type | NestedArray<Type>>;

/** Task that can be called to perform a promise based action */
type Task<ReturnType> = () => Promise<ReturnType>;
