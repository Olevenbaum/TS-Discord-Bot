// External library imports
import { type ClientEvents, Events } from "discord.js";

/**
 * Represents a Discord event handler loaded from a local file. Event handlers are used to respond to various Discord.js
 * client events, such as message creation, guild member updates, or bot readiness. These are typically loaded
 * dynamically and registered with the client.
 */
interface SavedEventType {
	/**
	 * Whether this event handler should only be called once. If true, the handler will be removed after the first
	 * execution. Useful for one-time initialization events like {@linkcode Events.ClientReady}.
	 */
	once?: boolean;

	/**
	 * The specific Discord event type this handler responds to. Determines which client event will trigger this
	 * handler's execution.
	 * @see {@linkcode ClientEvents}
	 */
	type: keyof ClientEvents;

	/**
	 * Executes the event handler logic when the associated event is emitted. Receives the event arguments specific to
	 * the event type and performs the necessary actions.
	 * @param args - The arguments emitted with the event, typed according to the event type.
	 */
	execute(...args: any): Promise<void>;
}
