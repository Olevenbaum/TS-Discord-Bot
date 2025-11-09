// Global imports
import "./fileReader";
import "./notifications";
import { applicationCommandTypes, configuration } from "./variables";

// Type imports
import { ApplicationCommandType } from "discord.js";
import { SavedApplicationCommandType } from "../types/applicationCommands";

declare global {
	/**
	 * Adds new application command types and removes outdated ones or reloads all application command types
	 * @param forceReload Whether to reload all files no matter if files were added or removed
	 */
	function updateApplicationCommandTypes(forceReload?: boolean): Promise<void>;

	/**
	 * Reloads the specified application command types or adds them if not already present
	 * @param applicationCommandTypes Application command type files to reload, passing an empty array results in the
	 * same behavior as not passing this parameter
	 * @param include Whether to include (`true`) or exclude (`false`) the specified application command types.
	 * Defaults to `true`
	 * @see {@link ApplicationCommandType}
	 */
	function updateApplicationCommandTypes(
		applicationCommandTypes?: (keyof typeof ApplicationCommandType)[],
		include?: boolean,
	): Promise<void>;
}

global.updateApplicationCommandTypes = async function (
	x: boolean | (keyof typeof ApplicationCommandType)[] = false,
	include: boolean = true,
): Promise<void> {
	/** Force reload overload parameter */
	const forceReload = typeof x === "boolean" ? x : false;

	/** Application command types overload parameter */
	const types = typeof x === "boolean" || x.length === 0 ? undefined : x;

	notify(
		"INFO",
		`Updating application command type${!Array.isArray(types) || types.length > 1 ? "s " : " "}${
			Array.isArray(types)
				? `${types.map((applicationCommandType) => `'${applicationCommandType}'`).join(", ")}`
				: ""
		}...`,
	);

	/** List of application command type files */
	const applicationCommandTypeFiles = await readFiles<SavedApplicationCommandType>(
		configuration.paths.applicationCommandTypesPath,
	);

	applicationCommandTypes.sweep(
		(_, applicationCommandType) =>
			!applicationCommandTypeFiles.some(
				(applicationCommandTypeFile) =>
					applicationCommandTypeFile.type === ApplicationCommandType[applicationCommandType],
			),
	);

	applicationCommandTypeFiles.forEach((applicationCommandTypeFile) => {
		if (
			forceReload ||
			(types &&
				types.includes(
					ApplicationCommandType[applicationCommandTypeFile.type] as keyof typeof ApplicationCommandType,
				)) === include ||
			!applicationCommandTypes.has(
				ApplicationCommandType[applicationCommandTypeFile.type] as keyof typeof ApplicationCommandType,
			)
		) {
			applicationCommandTypes.set(
				ApplicationCommandType[applicationCommandTypeFile.type] as keyof typeof ApplicationCommandType,
				applicationCommandTypeFile,
			);
		}
	});

	notify("SUCCESS", "Finished updating application command types");
};

export {};
