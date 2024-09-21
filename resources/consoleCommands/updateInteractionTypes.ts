// Global imports
import "../../globals/interactionTypeUpdate";
import "../../globals/notifications";

// Type imports
import { InteractionType, Client } from "discord.js";
import { Interface } from "readline";
import { Configuration } from "../../types/configuration";
import { ConsoleCommand, NestedArray } from "../../types/others";

/**
 * Console command to update application commands
 */
const consoleCommand: ConsoleCommand = {
    description: "Updates all or specified interaction types",
    name: "INTERACTIONTYPES",
    execute(
        configuration: Configuration,
        _: Client<true>,
        ___: Interface,
        ...values: NestedArray<boolean | number | string>
    ) {
        // Check if values are present
        if (values.length > 0) {
            // Check if values have the right type
            if (values.length === 1 && typeof values[0] === "boolean") {
                // Update all interaction types
                updateInteractionTypes(configuration, values[0]);
            } else if (values.length === 1 && Array.isArray(values[0])) {
                // Check if values have the right type
                if (values[0].every((value) => typeof value === "string")) {
                    // Update spefified interaction types
                    updateInteractionTypes(
                        configuration,
                        values[0].map((value) => InteractionType[value])
                    );
                } else {
                    // Notification
                    notify(configuration, "error", "Invalid parameters");
                }
            } else {
                // Check if values have the right type
                if (values.every((value) => typeof value === "string")) {
                    // Update spefified interaction types
                    updateInteractionTypes(
                        configuration,
                        values.map((value) => InteractionType[value])
                    );
                } else {
                    // Notification
                    notify(configuration, "error", "Invalid parameters");
                }
            }
        } else {
            // Update all interaction types
            updateInteractionTypes(configuration);
        }
    },
};

export default consoleCommand;
