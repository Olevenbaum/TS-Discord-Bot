// Global imports
import "../../globals/applicationCommandUpdate";

// Type imports
import { ApplicationCommandType, Client } from "discord.js";
import { Interface } from "readline";
import { Configuration } from "../../types/configuration";
import { ConsoleCommand, NestedArray } from "../../types/others";

/**
 * Console command to update application commands
 */
const consoleCommand: ConsoleCommand = {
	description: "Updates all or specified application commands",

	name: "UPDATEAPPLICATIONCOMMANDS",

	usage: [
		"updateApplicationCommands",
		"updateApplicationCommands <application command name 1> <application command name 2> ...",
		"updateApplicationCommands [<application command name 1> <application command name 2> ...]",
	],

	async execute(
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
				if (values[0].every((value) => typeof value === "string" && /^[A-Za-z]*[0-9]$/i.test(value))) {
					// Update spefified application commands
					updateApplicationCommands(
						configuration,
						client,
						values[0] as `${string}:${ApplicationCommandType}`[],
					);
				} else {
					throw TypeError("Invalid parameters");
				}
			} else {
				// Check if values have the right type
				if (values.every((value) => typeof value === "string")) {
					// Update spefified application commands
					updateApplicationCommands(configuration, client, values as `${string}:${ApplicationCommandType}`[]);
				} else {
					throw TypeError("Invalid parameters");
				}
			}
		} else {
			// Update all application commands
			updateApplicationCommands(configuration, client);
		}
	},
};

export default consoleCommand;
