// Class & type imports
import { ConsoleCommand } from "../../types";

// Data imports
import { applicationCommands } from "#variables";

// External libraries imports
import { ApplicationCommandType } from "discord.js";

// Module imports
import { updateApplicationCommands } from "../../modules/update";

/** Console command to update application commands */
const consoleCommand: ConsoleCommand = {
	description: "Updates all or specified application commands",
	name: "UPDATEAPPLICATIONCOMMANDS",
	parameters: [
		[
			{
				description: "List of application commands to update",
				name: "application commands",
				options: () =>
					Object.entries(applicationCommands)
						.map(([applicationCommandType, specificApplicationCommands]) =>
							specificApplicationCommands.map(
								(_, applicationCommandName) => `${applicationCommandName}:${applicationCommandType}`,
							),
						)
						.flat(),
				type: "object",
			},
			{
				description: "Whether all application commands should be updated regardless of changes",
				name: "force reload",
				type: "boolean",
			},
		],
	],

	async execute(...parameters: `${string}:${ApplicationCommandType}`[] | [boolean]) {
		// Call matching overload to update application commands
		if (parameters.length > 0) {
			if (typeof parameters[0] === "boolean") {
				updateApplicationCommands(parameters[0]);
			} else {
				const transformedParameters: Partial<Record<keyof typeof ApplicationCommandType, string[]>> = {};

				parameters.forEach((parameter) => {
					const colonPosition = (parameter as string).lastIndexOf(":");
					const applicationCommandType = (parameter as string).slice(colonPosition + 1);
					if (!(applicationCommandType in transformedParameters)) {
						transformedParameters[applicationCommandType as keyof typeof transformedParameters] = [];
					}

					transformedParameters[applicationCommandType as keyof typeof transformedParameters]!.push(
						(parameter as string).slice(undefined, colonPosition),
					);
				});

				updateApplicationCommands(transformedParameters);
			}
		} else {
			updateApplicationCommands();
		}
	},
};

export default consoleCommand;
