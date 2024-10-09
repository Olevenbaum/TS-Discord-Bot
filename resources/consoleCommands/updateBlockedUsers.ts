// Global imports
import "../../globals/fileUpdate";

// Type imports
import { Configuration } from "../../types/configuration";
import { ConsoleCommand } from "../../types/others";

/**
 * Template for console command
 */
const consoleCommand: ConsoleCommand = {
    description: "Updates all global blocked users",

    name: "UPDATEBLOCKEDUSERS",

    usage: "updateBlockedUsers",

    async execute(configuration: Configuration) {
        // Update global blocked users
        updateFiles(configuration, undefined, { blockedUsers: true });
    },
};

export default consoleCommand;
