// Module imports
import { main } from "./application/application";

// Type imports
import { Configuration } from "./types/interfaces";

// Data imports
import botConfiguration from "./configuration.json";

const configuration: Configuration = {
    bot: botConfiguration,

    project: {
        eventTypesPath: "./application/eventTypes",
        tokenRegex: /^([0-9a-z]{24})\.([0-9a-z]{6})\.([0-9a-z]{38})$/i,
    },
};

main(configuration);
