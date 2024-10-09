// Global imports
import "./applicationCommandUpdate";
import "./applicationCommandTypeUpdate";
import "./eventTypeUpdate";
import "./interactionTypeUpdate";
import "./modalUpdate";
import "./notifications";
import "./pathRelativation";
import { blockedUsers } from "./variables";

// Type imports
import { Client } from "discord.js";
import { Configuration } from "../types/configuration";
import { FileInclude } from "../types/others";

declare global {
    /**
     * Updates all changed files, adds new ones and deletes removed ones
     * @param configuration The configuration of the project and bot
     * @param client The Discord bot client
     * @param forceReload Whether to reload all files no matter if files were changed, added or removed
     */
    function updateFiles(configuration: Configuration, client?: Client, forceReload?: boolean): Promise<void>;

    /**
     * Updates all changed files, adds new ones and deletes removed ones
     * @param configuration The configuration of the project and bot
     * @param client The Discord bot client
     * @param include Files that should be reloaded, passing an empty object will result in the same behavior as not
     * passing this parameter
     * @param exclude Whether to include or exclude the specified files
     */
    function updateFiles(
        configuration: Configuration,
        client?: Client<true>,
        include?: FileInclude | (keyof FileInclude)[],
        exclude?: boolean
    ): Promise<void>;
}

global.updateFiles = async function (
    configuration: Configuration,
    client?: Client,
    x: boolean | FileInclude | (keyof FileInclude)[] = false,
    exclude: boolean = false
): Promise<void> {
    /**
     * Overload parameter
     */
    const forceReload = typeof x === "boolean" ? x : false;

    /**
     * Overload parameter
     */
    const include = typeof x === "boolean" || Object.keys(x).length === 0 ? undefined : x;

    // Overwrite exlude parameter if include is empty
    exclude &&= Boolean(include);

    // Call matching overload to update application commands
    if (!include) {
        updateApplicationCommands(configuration, client?.isReady() ? client : undefined, forceReload);
    } else if (Array.isArray(include)) {
        if (include.includes("applicationCommands") !== exclude) {
            updateApplicationCommands(configuration, client?.isReady() ? client : undefined);
        }
    } else if (typeof include.applicationCommands === "boolean" && !exclude) {
        updateApplicationCommands(configuration, client?.isReady() ? client : undefined, include.applicationCommands);
    } else if (Array.isArray(include.applicationCommands)) {
        updateApplicationCommands(
            configuration,
            client?.isReady() ? client : undefined,
            include.applicationCommands,
            exclude
        );
    }

    // Call matching overload to update application command types
    if (!include) {
        updateApplicationCommandTypes(configuration, forceReload);
    } else if (Array.isArray(include)) {
        if (include.includes("applicationCommandTypes") !== exclude) {
            updateApplicationCommandTypes(configuration);
        }
    } else if (typeof include.applicationCommandTypes === "boolean" && !exclude) {
        updateApplicationCommandTypes(configuration, include.applicationCommandTypes);
    } else if (Array.isArray(include.applicationCommandTypes)) {
        updateApplicationCommandTypes(configuration, include.applicationCommandTypes, exclude);
    }

    // Check if global blocked users should be updated
    if (
        !include ||
        exclude !==
            ((Array.isArray(include) && include.includes("blockedUsers")) ||
                (!Array.isArray(include) && Boolean(include.blockedUsers)))
    ) {
        // Notification
        notify(configuration, "info", "Updating global blocked users...");

        // Import new blocked users
        const newBlockedUsers = (await import(
            relativePath(configuration.project.blockedUsersPath)
        )) as typeof blockedUsers;

        // Iterate through blocked users
        blockedUsers.global.forEach((blockedUser, index) => {
            // Check if blocked user is still blocked
            if (!newBlockedUsers.global.includes(blockedUser)) {
                // Remove blocked user
                blockedUsers.global.splice(index, 1);
            }
        });

        // Iterate through new blocked users
        newBlockedUsers.global.forEach((blockedUser) => {
            // Check if blocked user is not already blocked
            if (!blockedUsers.global.includes(blockedUser)) {
                // Add blocked user
                blockedUsers.global.push(blockedUser);
            }
        });

        // Notification
        notify(configuration, "success", "Finished updating global blocked users");
    }

    // Check if configuration should be updated
    if (
        !include ||
        exclude !==
            ((Array.isArray(include) && include.includes("configuration")) ||
                (!Array.isArray(include) && Boolean(include.configuration)))
    ) {
        // Notification
        notify(configuration, "info", "Updating configuration data...");

        // Reload configuration
        configuration.bot = await import(relativePath(configuration.project.configurationPath));

        // Notification
        notify(configuration, "success", "Finished updating configuration data");
    }

    // Check if client was provided
    if (client) {
        // Call matching overload to update events
        if (!include) {
            updateEventTypes(configuration, client, forceReload);
        } else if (Array.isArray(include)) {
            if (include.includes("eventTypes") !== exclude) {
                updateEventTypes(configuration, client);
            }
        } else if (typeof include.eventTypes === "boolean" && !exclude) {
            updateEventTypes(configuration, client, include.eventTypes);
        } else if (Array.isArray(include.eventTypes)) {
            updateEventTypes(configuration, client, include.eventTypes, exclude);
        }
    }

    // Call matching overload to update interaction types
    if (!include) {
        updateInteractionTypes(configuration, forceReload);
    } else if (Array.isArray(include)) {
        if (include.includes("interactionTypes") !== exclude) {
            updateInteractionTypes(configuration);
        }
    } else if (typeof include.interactionTypes === "boolean" && !exclude) {
        updateInteractionTypes(configuration, include.interactionTypes);
    } else if (Array.isArray(include.interactionTypes)) {
        updateInteractionTypes(configuration, include.interactionTypes, exclude);
    }

    // Call matching overload to update modals
    if (!include) {
        updateModals(configuration, forceReload);
    } else if (Array.isArray(include)) {
        if (include.includes("modals") !== exclude) {
            updateModals(configuration);
        }
    } else if (typeof include.modals === "boolean" && !exclude) {
        updateModals(configuration, include.modals);
    } else if (Array.isArray(include.modals)) {
        updateModals(configuration, include.modals, exclude);
    }
};

export {};
