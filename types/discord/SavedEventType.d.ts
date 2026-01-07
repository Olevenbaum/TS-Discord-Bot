// Type imports
import { ClientEvents, Events } from "discord.js";

/** Event type imported from local file */
interface SavedEventType {
	/** Whether the event is called once */
	once?: boolean;

	/**
	 * Type of the event
	 * @see {@link Events}
	 */
	type: Events;

	/**
	 * Forwards the prompt to response to the event or handles it by itself
	 * @param args The needed arguments to response to an interaction or the emitted event
	 */
	execute(...args: ClientEvents[Event]): Promise<void>;
}
