// Class & type imports
import { ConsoleCommand } from "../../types/consoleCommands";

// Data imports
import { interactionTypes } from "../../resources/variables";

// External libraries imports
import { InteractionType } from "discord.js";

// Module imports
import { updateInteractionTypes } from "../../modules/update";

/** Console command to update interaction types */
const consoleCommand: ConsoleCommand = {
	description: "Updates all or specified interaction types",
	name: "INTERACTIONTYPES",
	parameters: [
		[
			{
				description: "List of interaction types to update",
				name: "interaction types",
				options: () => Object.keys(interactionTypes),
				type: "object",
			},
			{
				description: "Whether all interaction types should be updated regardless of changes",
				name: "force reload",
				type: "boolean",
			},
		],
	],

	async execute(...parameters: (keyof typeof InteractionType)[] | [boolean]) {
		// Call matching overload to update interaction types
		if (parameters.length > 0) {
			if (typeof parameters[0] === "boolean") {
				updateInteractionTypes(parameters[0]);
			} else {
				updateInteractionTypes(parameters as (keyof typeof InteractionType)[]);
			}
		} else {
			updateInteractionTypes();
		}
	},
};

export default consoleCommand;
