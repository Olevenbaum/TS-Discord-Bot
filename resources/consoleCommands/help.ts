// Class & type imports
import { ConsoleCommand } from "../../types";

// Data imports
import { cli } from "#application";

// Module imports
import notify from "../../modules/notification";

/** Template for console command */
const consoleCommand: ConsoleCommand = {
	description: "",
	name: "HELP",
	parameters: {
		description: "Name of the command to get help for",
		name: "command",
		options: () => cli.commands.map((command) => command.name.toLowerCase()),
		type: "string",
	},

	execute(...parameters: [string] | []) {
		if (parameters.length === 0) {
			notify(
				`Available commands:\n${cli.commands
					.map((command) => `- ${command.name}: ${command.description}`)
					.join("\n")}\n\nUse HELP <command> to get more information about a specific command.`,
				"INFORMATION",
			);
		} else {
			/**
			 * Command to get help for
			 * @see {@linkcode ConsoleCommand}
			 */
			const command = cli.commands.find((consoleCommand) => consoleCommand.name === parameters[0].toUpperCase());

			if (command) {
				notify(
					`Help for command '${command.name}':\nDescription: ${command.description}\nParameters:\n${
						command.parameters
							? Array.isArray(command.parameters)
								? command.parameters
										.map((parameter) =>
											Array.isArray(parameter)
												? "One of the following:\n" +
													parameter
														.map(
															(singleParameter) =>
																`  - ${singleParameter.required ? "[REQUIRED]" : ""} ${
																	singleParameter.name
																} (${singleParameter.type}): ${
																	singleParameter.description
																}`,
														)
														.join("\n")
												: `- ${parameter.required ? "[REQUIRED]" : ""} ${parameter.name} (${
														parameter.type
													}): ${parameter.description}`,
										)
										.join("\n")
								: `- ${command.parameters.required ? "[REQUIRED]" : ""} ${command.parameters.name} (${
										command.parameters.type
									}): ${command.parameters.description}`
							: "None"
					}`,
					"INFORMATION",
				);
			} else {
				notify(`No console command '${parameters[0]}'`, "WARNING");
			}
		}
	},
};

export default consoleCommand;
