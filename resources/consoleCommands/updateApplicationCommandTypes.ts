// Class & type imports
import { ConsoleCommand } from "../../types";

// Data imports
import { applicationCommandTypes } from "../../resources/variables";

// External libraries imports
import { ApplicationCommandType } from "discord.js";

// Module imports
import { updateApplicationCommandTypes } from "../../modules/update";

/** Console command to update application command types */
const consoleCommand: ConsoleCommand = {
	description: "Updates all or specified application command types",
	name: "UPDATEAPPLICATIONCOMMANDTYPES",
	parameters: [
		[
			{
				description: "List of application command types to update",
				name: "application command types",
				options: () => Object.keys(applicationCommandTypes),
				type: "object",
			},
			{
				description: "Whether all application command types should be updated regardless of changes",
				name: "force reload",
				type: "boolean",
			},
		],
	],

	async execute(...parameters: (keyof typeof ApplicationCommandType)[] | [boolean]) {
		if (parameters.length > 0) {
			if (typeof parameters[0] === "boolean") {
				updateApplicationCommandTypes(parameters[0]);
			} else {
				updateApplicationCommandTypes(parameters as (keyof typeof ApplicationCommandType)[]);
			}
		} else {
			updateApplicationCommandTypes();
		}
	},
};

export default consoleCommand;
