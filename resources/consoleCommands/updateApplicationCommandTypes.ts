// Global imports
import "../../globals/applicationCommandTypeUpdate";
import "../../globals/notifications";

// Type imports
import { Client } from "discord.js";
import { Interface } from "readline";
import { Configuration } from "../../types/configuration";
import { ConsoleCommand, NestedArray } from "../../types/others";

/**
 * Console command to update application command types
 */
const consoleCommand: ConsoleCommand = {
    description: "Updates all or spefified application command types",

    name: "UPDATEAPPLICATIONCOMMANDTYPES",

    usage: [
        "updateApplicationCommandTypes",
        "updateApplicationCommandTypes <application command type 1> <application command type 2> ...",
        "updateApplicationCommandTypes [<application command type 1> <application command type 2> ...]",
    ],

    async execute(
        configuration: Configuration,
        _: Client<true>,
        __: Interface,
        ...values: NestedArray<boolean | number | string>
    ) {
        // Check if values are present
        if (values.length > 0) {
            // Check if values have the right type
            if (values.length === 1 && typeof values[0] === "boolean") {
                // Update all application command types
                updateApplicationCommandTypes(configuration, values[0]);
            } else if (values.length === 1 && Array.isArray(values[0])) {
                // Check if values have the right type
                if (values[0].every((value) => typeof value === "number")) {
                    // Update spefified application command types
                    updateApplicationCommandTypes(configuration, values[0]);
                } else {
                    // Notification
                    notify(configuration, "error", "Invalid parameters");
                }
            } else {
                // Check if values have the right type
                if (values.every((value) => typeof value === "number")) {
                    // Update spefified application command types
                    updateApplicationCommandTypes(configuration, values);
                } else {
                    // Notification
                    notify(configuration, "error", "Invalid parameters");
                }
            }
        } else {
            // Update all application command types
            updateApplicationCommandTypes(configuration);
        }
    },
};

export default consoleCommand;
