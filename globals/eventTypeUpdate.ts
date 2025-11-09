// Global imports
import "./fileReader";
import "./notifications";
import { configuration } from "./variables";

// Type imports
import { Client, ClientEvents } from "discord.js";
import { SavedEventType } from "../types/others";

declare global {
	/**
	 * Adds new event types and removes outdated ones or reloads all event types
	 * @param client The Discord bot client to add the listeners to
	 * @param forceReload Whether to reload all files no matter if files were added or removed
	 * @see {@link Client}
	 */
	function updateEventTypes(client: Client, forceReload?: boolean): Promise<void>;

	/**
	 * Reloads the specified event types or adds them if not already present
	 * @param client The Discord bot client to add the listeners to
	 * @param eventTypes Event type files to reload, passing an empty array results in the same behavior as
	 * not passing this parameter
	 * @param include Whether to include (`true`) or exclude (`false`) the specified event types. Defaults to `true`
	 * @see {@link Client} | {@link ClientEvents}
	 */
	function updateEventTypes(client: Client, eventTypes?: (keyof ClientEvents)[], include?: boolean): Promise<void>;
}

global.updateEventTypes = async function (
	client,
	x: boolean | (keyof ClientEvents)[] = false,
	include: boolean = true,
) {
	/** Force reload overload parameter */
	const forceReload = typeof x === "boolean" ? x : false;

	/** Event types overload parameter */
	const eventTypes = typeof x === "boolean" || x.length === 0 ? undefined : x;

	notify(
		"INFO",
		`Updating event type${Array.isArray(eventTypes) && eventTypes.length === 1 ? "" : "s"}${
			Array.isArray(eventTypes) ? eventTypes.map((eventType) => ` '${eventType}'`).join(", ") : ""
		}...`,
	);

	/** List of event type files */
	const eventTypeFiles = await readFiles<SavedEventType>(configuration.paths.eventTypesPath);

	(client.eventNames() as (keyof ClientEvents)[]).forEach((eventType) => {
		if (
			forceReload ||
			(eventTypes?.includes(eventType) ?? true) === include ||
			!eventTypeFiles.some((eventTypeFile) => eventTypeFile.type === eventType)
		) {
			client.removeAllListeners(eventType);
		}
	});

	eventTypeFiles.forEach((eventTypeFile) => {
		if ((eventTypes?.includes(eventTypeFile.type) ?? true) === include) {
			if (eventTypeFile.once) {
				client.once(eventTypeFile.type, (...args) => eventTypeFile.execute(...args));
			} else {
				client.on(eventTypeFile.type, (...args) => eventTypeFile.execute(...args));
			}
		}
	});

	notify("SUCCESS", "Finished updating event types");
};

export {};
