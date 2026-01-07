// Class & type imports
import type { SavedEventType } from "../../types";

// Data imports
import { client } from "#application";
import { configuration } from "#variables";

// External libraries imports
import { Client, type ClientEvents, Events } from "discord.js";

// Module imports
import readFiles from "../fileReader";
import notify from "../notification";

/**
 * Iterates all files in the event type directories. If files were deleted, the matching event  types are removed from
 * the collection. If files were added the matching event types are added to the collection. On force reload remaining
 * event types are reloaded from the matching files.
 * @param forceReload - Whether to reload all existing component types (defaults to `false`)
 * @see {@link Client}
 */
export default async function updateEventTypes(forceReload?: boolean): Promise<void>;

/**
 * Iterates all files in the event type directories. If files were deleted, the matching event types are removed from
 * the collection. If files were added the matching event types are added to the collection. Any specified event types
 * are either reloaded or excluded from reloading.
 * @param eventTypes - Event types to reload or exclude from reloading
 * @param exclude - Whether to include (`false`) or exclude (`true`) the specified event types (defaults to `false`)
 * @see {@link Events}
 */
export default async function updateEventTypes(eventTypes: Events[], exclude?: boolean): Promise<void>;

export default async function updateEventTypes(x: boolean | Events[] = false, exclude: boolean = false) {
	/** Force reload overload parameter */
	const forceReload = typeof x === "boolean" ? x : false;

	/** Event types overload parameter */
	const eventTypes =
		typeof x === "boolean" || x.length === 0 ? undefined : x.map((eventType) => ClientEvents[eventType]);

	notify(
		`Updating event type${!Array.isArray(eventTypes) || eventTypes.length > 1 ? "s" : ""}${
			Array.isArray(eventTypes) ? eventTypes.map((eventType) => ` '${Events[eventType]}'`).join(", ") : ""
		}...`,
		"INFORMATION",
	);

	/** List of event type files */
	const eventTypeFiles = await readFiles<SavedEventType>(configuration.paths.eventTypesPath);

	client.eventNames().forEach((eventType) => {
		if (
			forceReload ||
			(eventTypes?.includes(eventType) ?? true) !== exclude ||
			!eventTypeFiles.some((eventTypeFile) => eventTypeFile.type === eventType)
		) {
			client.removeAllListeners(eventType);
		}
	});

	eventTypeFiles.forEach((eventTypeFile) => {
		if ((eventTypes?.includes(eventTypeFile.type) ?? true) !== exclude) {
			if (eventTypeFile.once) {
				client.once(eventTypeFile.type, (...args) => eventTypeFile.execute(...args));
			} else {
				client.on(eventTypeFile.type, (...args) => eventTypeFile.execute(...args));
			}
		}
	});

	notify("Finished updating event types", "SUCCESS");
}
