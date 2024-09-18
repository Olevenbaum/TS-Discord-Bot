// Data imports
import botConfiguration from "./resources/configuration.json";
import paths from "./resources/paths.json";

// Module imports
import { main } from "./application/application";

// Type imports
import { Configuration } from "./types/configuration";

// Initialize configuration
const configuration: Configuration = {
    bot: botConfiguration,
    project: {
        ...{
            applicationCommandAutocompleteErrorCooldown: 300,
            tokenRegex: /^([0-9a-z]{24})\.([0-9a-z]{6})\.([0-9a-z]{38})$/i,
        },
        ...paths,
    },
};

// Start bot
main(configuration);
