// Global imports
import "./date";
import "./fileReader";
import "./pathRelativation";
import "./fileUpdate";
import "./notifications";
import { configuration, consoleCommands } from "./variables";

// Module imports
import * as rl from "readline";

// Type imports
import { Client } from "discord.js";
import { ConsoleCommand, ConsoleCommandParameterData, NestedArray } from "../types/others";

declare global {
	/**
	 * Handles any commands entered in the console while the bot is running
	 * @param client The Discord bot client
	 * @see {@link Client}
	 */
	function consoleCommandHandler(client: Client): void;
}

global.consoleCommandHandler = async function (client) {
	/** Readline interface */
	const rlInterface = rl.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: `[${getTime(configuration.bot.logDate)}] \x1b[35m Enter command: \x1b[0m`,
	});

	consoleCommands.push(...(await readFiles<ConsoleCommand>(configuration.paths.consoleCommandsPath)));

	if (consoleCommands.length === 0) {
		return;
	}

	rlInterface.prompt();

	rlInterface.once("close", () => process.exit());

	rlInterface.on("line", (consoleInput: string) => {
		/** Command name without whitespace or parameters */
		const commandName = consoleInput
			.trim()
			.slice(0, consoleInput.includes(" ") ? consoleInput.indexOf(" ") : undefined);

		/** Command that was called */
		const command = consoleCommands.find(
			(consoleCommand) =>
				consoleCommand.name === commandName.toUpperCase() ||
				(consoleCommand.aliases &&
					consoleCommand.aliases.map((alias) => alias).includes(commandName.toUpperCase())),
		);

		if (!command) {
			notify("ERROR", `Found no command '${commandName}'`);

			return;
		}

		consoleInput = consoleInput.replace(commandName, "").trim();

		try {
			/** Parameters that were passed to the command */
			const parameters =
				consoleInput.length > 0 && command.parameters
					? transformParameters(consoleInput, command.parameters)
					: [];

			if (!Array.isArray(command.parameters) && command.parameters?.type === "object") {
				command.execute(client, rlInterface, parameters);
			} else {
				command.execute(client, rlInterface, ...parameters);
			}
		} catch (error) {
			if (error instanceof TypeError && error.message === "Invalid parameters") {
				notify("ERROR", `Command '${command.name}' received invalid parameters`);
			} else {
				throw error;
			}
		}

		rlInterface.prompt();
	});
};

/**
 * Transforms a string of parameters into a nested array of values
 * @param parameters The string of parameters to transform
 * @param parameterData The data of the parameters the console command takes to validate against
 * @returns A nested array of values
 * @see {@link NestedArray}
 */
function transformParameters(
	parameters: string,
	parameterData?: ConsoleCommandParameterData | NestedArray<ConsoleCommandParameterData>,
): NestedArray<boolean | number | string> {
	parameters = parameters.trim();

	/** Transformed parameters with correct types and validation */
	const transformedParameters: NestedArray<boolean | number | string> = [];

	for (var counter = 0; counter < parameters.length; ) {
		if ([" ", ","].includes(parameters[counter]!)) {
			counter++;

			continue;
		}

		if (['"', "'", "`"].includes(parameters[counter]!)) {
			/** Position of the next quotation mark of the same type */
			const parameterEnd = parameters.indexOf(parameters[counter]!, counter + 1);

			if (parameterEnd < 0) {
				throw TypeError("Invalid parameters");
			}

			transformedParameters.push(parameters.slice(counter + 1, parameterEnd));

			counter = parameterEnd + 1;
		} else {
			/** Position of the next blank space or comma */
			const nextSeperator = parameters.slice(counter).search(/[\s,]/) + counter;

			/** End of the current parameter */
			const parameterEnd = nextSeperator >= counter ? nextSeperator : parameters.length;

			/** Current parameter */
			const parameter = parameters.slice(counter, parameterEnd).trim();

			if (["true", "false"].includes(parameter.toLowerCase())) {
				transformedParameters.push(Boolean(parameter.toLowerCase()));
			} else if (parameter.startsWith("[") && parameter.endsWith("]")) {
				transformedParameters.push(transformParameters(parameter));
			} else if (/^-?\d*([\.\,]?\d+)?$/.test(parameter)) {
				transformedParameters.push(Number(parameter));
			} else {
				transformedParameters.push(parameter);
			}

			counter = parameterEnd + 1;
		}
	}

	if (parameterData && !testParameters(transformedParameters, parameterData)) {
		throw TypeError("Invalid parameters");
	}

	return transformedParameters;
}

function testParameters(
	parameters: NestedArray<boolean | number | string>,
	parameterData: ConsoleCommandParameterData | NestedArray<ConsoleCommandParameterData>,
): boolean {
	if (Array.isArray(parameterData)) {
		const x = parameterData[-1];
		x;
		return parameters.slice(undefined, parameterData.length - 1).every((parameter, index) => {
			if (Array.isArray(parameterData[index])) {
				return parameterData[index].some((singleParameterData) =>
					testParameter(parameter, singleParameterData as ConsoleCommandParameterData),
				);
			}

			return testParameter(parameter, parameterData[index] as ConsoleCommandParameterData);
		}) && Array.isArray(parameterData[parameterData.length - 1])
			? (parameterData[parameterData.length - 1] as NestedArray<ConsoleCommandParameterData>).some(
					(singleparameterData) =>
						testParameter(
							parameters.slice(parameterData.length - 1),
							singleparameterData as ConsoleCommandParameterData,
						),
			  )
			: testParameter(
					parameters.slice(parameterData.length - 1),
					parameterData[parameterData.length - 1] as ConsoleCommandParameterData,
			  );
	}

	if (parameters.length > 1) {
		return testParameter(parameters, parameterData);
	}

	return testParameter(parameters[0] as boolean | number | string, parameterData);
}

function testParameter(
	parameter: boolean | number | string | NestedArray<boolean | number | string>,
	parameterData: ConsoleCommandParameterData,
): boolean {
	if (parameterData.type !== "object" && typeof parameter !== parameterData.type) {
		return false;
	}

	switch (parameterData.type) {
		case "boolean":
			break;
		case "number":
			if (
				parameterData.range &&
				((parameter as number) < parameterData.range[0] || (parameter as number) > parameterData.range[1])
			) {
				return false;
			}

			break;
		case "object":
			if (!Array.isArray(parameter)) {
				parameter = [parameter];
			}

			if (parameterData.options && typeof parameterData.options === "function") {
				parameterData.options = parameterData.options();
			}

			if (
				(parameterData.options &&
					parameterData.options.length > 0 &&
					!(parameter as string[]).every((item) => (parameterData.options as string[]).includes(item))) ||
				(parameterData.pattern && !(parameter as string[]).every((item) => parameterData.pattern!.test(item)))
			) {
				return false;
			}

			break;
		case "string":
			if (parameterData.options && typeof parameterData.options === "function") {
				parameterData.options = parameterData.options();
			}

			if (
				(parameterData.options &&
					parameterData.options.length > 0 &&
					!parameterData.options.includes(parameter as string)) ||
				(parameterData.pattern && !(parameter as string).match(parameterData.pattern))
			) {
				return false;
			}

			break;
		default:
			return false;
	}

	return true;
}
