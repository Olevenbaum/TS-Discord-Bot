// Data imports
import newBlockedUsers from "../resources/blockedUsers.json";

// Global imports
import "./applicationCommandUpdate";
import "./applicationCommandTypeUpdate";
import "./interactionTypeUpdate";
import { blockedUsers } from "./variables";

// Type imports
import { Client } from "discord.js";
import { Configuration } from "../types/configuration";
import { FileInclude } from "../types/others";

declare global {
    /**
     * Updates all changed files, adds new ones and deletes removed ones
     * @param configuration The configuration of the project and bot
     * @param forceReload Whether to reload all files no matter if files were changed, added or removed
     * @param client The Discord bot client
     */
    function updateFiles(configuration: Configuration, forceReload?: boolean, client?: Client<true>): void;

    /**
     * Updates all changed files, adds new ones and deletes removed ones
     * @param configuration The configuration of the project and bot
     * @param include Files that should be reloaded, passing an empty array will result in the same behavior as not
     * passing this parameter
     * @param client The Discord bot client
     */
    function updateFiles(configuration: Configuration, include?: FileInclude, client?: Client<true>): void;
}

global.updateFiles = async function (
    configuration: Configuration,
    x: boolean | FileInclude = false,
    client?: Client<true>
) {
    /**
     * Overload parameter
     */
    const forceReload = typeof x === "boolean" ? x : false;

    /**
     * Overload parameter
     */
    const include = typeof x === "boolean" ? undefined : x;

    // Check if a client was given
    if (!include || include.applicationCommands) {
        // Call matching overload to update application commands
        if (typeof x === "boolean") {
            updateApplicationCommands(configuration, client, forceReload);
        } else if (typeof x.applicationCommands === "boolean") {
            updateApplicationCommands(configuration, client, x.applicationCommands);
        } else {
            updateApplicationCommands(configuration, client, x.applicationCommands);
        }
    }

    // Check whether application command types should be updated
    if (!include || include.applicationCommandTypes) {
        // Call matching overload to update application command types
        if (typeof x === "boolean") {
            updateApplicationCommandTypes(configuration, forceReload);
        } else if (typeof x.applicationCommandTypes === "boolean") {
            updateApplicationCommandTypes(configuration, x.applicationCommandTypes);
        } else {
            updateApplicationCommandTypes(configuration, x.applicationCommandTypes);
        }
    }

    // Check whether interaction types should be updated
    if (!include || include.interactionTypes) {
        // Call matching overload to update interaction types
        if (typeof x === "boolean") {
            updateInteractionTypes(configuration, forceReload);
        } else if (typeof x.interactionTypes === "boolean") {
            updateInteractionTypes(configuration, x.interactionTypes);
        } else {
            updateInteractionTypes(configuration, x.interactionTypes);
        }
    }

    // Check if blocked users should be updated
    if (!include || include.blockedUsers) {
        // Remove old blocked users
        blockedUsers.forEach((blockedUser, index) => {
            if (!(blockedUser in newBlockedUsers)) {
                blockedUsers.splice(index, 1);
            }
        });

        // Add new blocked users
        newBlockedUsers.forEach((blockedUser) => {
            if (!(blockedUser in blockedUsers)) {
                blockedUsers.push(blockedUser);
            }
        });
    }
};

export {};
