// Global imports
import "../../globals/applicationCommandUpdate";
import "../../globals/notifications";

// Type imports
import { Client } from "discord.js";
import { Interface } from "readline";
import { Configuration } from "../../types/configuration";
import { ConsoleCommand, NestedArray } from "../../types/others";

/**
 * Console command to update application commands
 */
const consoleCommand: ConsoleCommand = {
    description: "Updates the given application commands",
    name: "UPDATEAPPLICATIONCOMMANDS",
    execute(
        configuration: Configuration,
        client: Client<true>,
        _: Interface,
        ...values: NestedArray<boolean | number | string>
    ) {
        // Check if values are present
        if (values.length > 0) {
            // Check if values have the right type
            if (values.length === 1 && typeof values[0] === "boolean") {
                // Update all application commands
                updateApplicationCommands(configuration, client, values[0]);
            } else if (values.length === 1 && Array.isArray(values[0])) {
                // Check if values have the right type
                if (values[0].every((value) => typeof value === "string")) {
                    // Update spefified application commands
                    updateApplicationCommands(configuration, client, values[0]);
                } else {
                    // Notification
                    notify(configuration, "error", "Invalid parameters");
                }
            } else {
                // Check if values have the right type
                if (values.every((value) => typeof value === "string")) {
                    // Update spefified application commands
                    updateApplicationCommands(configuration, client, values);
                } else {
                    // Notification
                    notify(configuration, "error", "Invalid parameters");
                }
            }
        } else {
            // Update all application commands
            updateApplicationCommands(configuration, client);
        }
    },
};

export default consoleCommand;
