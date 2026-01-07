// Class & type imports
import type { SavedApplicationCommandType } from "../../types";

// Data imports
import { applicationCommandTypes, configuration } from "#variables";

// External libraries imports
import { ApplicationCommandType } from "discord.js";

// Module imports
import readFiles from "../fileReader";
import notify from "../notification";

/**
 * Iterates all files in the application command type directories. If files were deleted, the matching application
 * command types are removed from the collection. If files were added the matching application command types are added
 * to the collection. On force reload remaining application command types are reloaded from the matching files.
 * @param forceReload - Whether to reload all existing application command types (defaults to `false`)
 */
export default async function updateApplicationCommandTypes(forceReload?: boolean): Promise<void>;

/**
 * Iterates all files in the application command type directories. If files were deleted, the matching application
 * command types are removed from the collection. If files were added the matching application command types are added
 * to the collection. Any specified application command types are either reloaded or excluded from reloading.
 * @param applicationCommandTypes - Application command types to reload or exclude from reloading
 * @param exclude - Whether to include (`false`) or exclude (`true`) the specified application command types (defaults
 * to `false`)
 * @see {@link ApplicationCommandType}
 */
export default async function updateApplicationCommandTypes(
	applicationCommandTypes: ApplicationCommandType[] | (keyof typeof ApplicationCommandType)[],
	exclude: boolean,
): Promise<void>;

export default async function updateApplicationCommandTypes(
	x: boolean | ApplicationCommandType[] | (keyof typeof ApplicationCommandType)[] = false,
	exclude: boolean = false,
) {
	/** Force reload overload parameter */
	const forceReload = typeof x === "boolean" ? x : false;

	/** Application command types overload parameter */
	const types =
		typeof x === "boolean" || x.length === 0
			? undefined
			: x.every((applicationCommandType) => typeof applicationCommandType === "string")
			? x.map((applicationCommandType) => ApplicationCommandType[applicationCommandType])
			: x;

	notify(
		`Updating application command type${!Array.isArray(types) || types.length > 1 ? "s" : ""}${
			Array.isArray(types)
				? ` ${types
						.map((applicationCommandType) => `'${ApplicationCommandType[applicationCommandType]}'`)
						.join(", ")}`
				: ""
		}...`,
		"INFORMATION",
	);

	/** List of application command type files */
	const applicationCommandTypeFiles = await readFiles<SavedApplicationCommandType>(
		configuration.paths.applicationCommandTypesPath,
	);

	if (!types || exclude) {
		applicationCommandTypes.sweep(
			(_, applicationCommandType) =>
				!applicationCommandTypeFiles.some(
					(applicationCommandTypeFile) => applicationCommandTypeFile.type === applicationCommandType,
				),
		);
	}

	applicationCommandTypeFiles.forEach((applicationCommandTypeFile) => {
		if (
			forceReload ||
			(types && types.includes(applicationCommandTypeFile.type) !== exclude) ||
			!applicationCommandTypes.has(applicationCommandTypeFile.type)
		) {
			applicationCommandTypes.set(applicationCommandTypeFile.type, applicationCommandTypeFile);
		}
	});

	notify("Finished updating application command types", "SUCCESS");
}
