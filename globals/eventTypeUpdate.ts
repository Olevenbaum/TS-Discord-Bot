// Global imports
import "./fileReader";
import "./notifications";

// Type imports
import { Client, ClientEvents } from "discord.js";
import { Configuration } from "types/configuration";
import { SavedEventType } from "types/others";

declare global {
    /**
     * Adds new event types and removes outdated ones or reloads all event types
     * @param configuration The configuration of the project and bot
     * @param client The Discord bot client to add the listeners to
     * @param forceReload Whether to reload all files no matter if files were added or removed
     */
    function updateEventTypes(configuration: Configuration, client: Client, forceReload?: boolean): Promise<void>;

    /**
     * Reloads the specified event types or adds them if not already present
     * @param configuration The configuration of the project and bot
     * @param client The Discord bot client to add the listeners to
     * @param include Event type files to reload, passing an empty array results in the same behavior as
     * not passing this parameter
     * @param exclude Whether to include or exclude the specified event types
     */
    function updateEventTypes(
        configuration: Configuration,
        client: Client,
        include?: (keyof ClientEvents)[],
        exclude?: boolean
    ): Promise<void>;
}

global.updateEventTypes = async function (
    configuration: Configuration,
    client: Client,
    x: boolean | (keyof ClientEvents)[] = false,
    exclude: boolean = false
): Promise<void> {
    /**
     * Overload parameter
     */
    const forceReload = typeof x === "boolean" ? x : false;

    /**
     * Overload parameter
     */
    const include = typeof x === "boolean" || x.length === 0 ? undefined : x;

    // Overwrite exlude parameter if include is empty
    exclude &&= Boolean(include);

    // Notification
    notify(
        configuration,
        "info",
        `Updating event type${!Array.isArray(include) || include.length > 1 ? "s" : ""}${
            Array.isArray(include) ? ` ${include.map((eventType) => `'${eventType}'`).join(", ")}` : ""
        }...`
    );

    /**
     * List of event type files
     */
    const eventTypeFiles = await readFiles<SavedEventType>(configuration, configuration.project.eventTypesPath);

    // Iterate through registered event listeners
    (client.eventNames() as (keyof ClientEvents)[]).forEach((eventType) => {
        if (
            forceReload ||
            exclude !== (include?.includes(eventType) ?? true) ||
            !eventTypeFiles.some((eventTypeFile) => eventTypeFile.type === eventType)
        ) {
            // Remove event listener
            client.removeAllListeners(eventType);
        }
    });

    // Iterate through event types
    eventTypeFiles.forEach((eventTypeFile) => {
        // Check if event type needs to be loaded
        if (exclude !== (include?.includes(eventTypeFile.type) ?? true)) {
            // Check whether event type is called once
            if (eventTypeFile.once) {
                // Add once event listener
                client.once(eventTypeFile.type, (...args) => eventTypeFile.execute(configuration, ...args));
            } else {
                // Add event listener
                client.on(eventTypeFile.type, (...args) => eventTypeFile.execute(configuration, ...args));
            }
        }
    });

    // Notification
    notify(configuration, "success", "Finished updating event types");
};

export {};
