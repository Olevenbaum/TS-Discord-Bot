// GLobal imports
import "../../globals/pathRelativation";

// Type imports
import { Configuration } from "../../types/configuration";
import { ConsoleCommand } from "../../types/others";

/**
 * Template for console command
 */
const consoleCommand: ConsoleCommand = {
    aliases: ["UPDATECONFIGURATION"],

    description: "Updates the configuration data",

    name: "UPDATECONFIGURATIONDATA",

    usage: "updateConfigurationData",

    async execute(configuration: Configuration) {
        // Reload configuration
        configuration.bot = await import(relativePath(configuration.project.configurationPath));
    },
};

export default consoleCommand;
