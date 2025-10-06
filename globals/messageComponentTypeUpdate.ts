// Global imports
import "./fileReader";
import "./notifications";
import { messageComponentTypes } from "./variables";

// Type imports
import { ComponentType, MessageComponentType } from "discord.js";
import { SavedMessageComponentType } from "../types/components";
import { Configuration } from "../types/configuration";

declare global {
    /**
     * Adds new application command types and removes outdated ones or reloads all application command types
     * @param configuration The configuration of the project and bot
     * @param forceReload Whether to reload all files no matter if files were added or removed
     */
    function updateMessageComponentTypes(configuration: Configuration, forceReload?: boolean): Promise<void>;

    /**
     * Reloads the specified application command types or adds them if not already present
     * @param configuration The configuration of the project and bot
     * @param include Application command type files to reload, passing an empty array results in the same behavior as
     * not passing this parameter
     * @param exclude Whether to include or exclude the specified application command types
     */
    function updateMessageComponentTypes(
        configuration: Configuration,
        include?: MessageComponentType[],
        exclude?: boolean
    ): Promise<void>;
}

global.updateMessageComponentTypes = async function (
    configuration: Configuration,
    x: boolean | MessageComponentType[] = false,
    exclude: boolean = false
): Promise<void> {
    /**
     * Overload parameter
     */
    const forceReload = typeof x === "boolean" ? x : false;

    /**
     * Overload parameter
     */
    const include = typeof x === "boolean" || x.length === 0 ? undefined : x;

    exclude &&= Boolean(include);

    notify(
		configuration,
		"INFO",
		`Updating message component type${!Array.isArray(include) || include.length > 1 ? "s" : ""}${
			Array.isArray(include)
				? ` ${include.map((messageComponentType) => `'${ComponentType[messageComponentType]}'`).join(", ")}`
				: ""
		}...`,
	);

	/**
	 * List of message component type files
	 */
	const messageComponentTypeFiles = await readFiles<SavedMessageComponentType>(
		configuration,
		configuration.project.messageComponentTypesPath,
	);

	messageComponentTypes.sweep(
		(_, messageComponentType) =>
			!messageComponentTypeFiles.some(
				(messageComponentTypeFile) => messageComponentTypeFile.type === messageComponentType,
			),
	);

	messageComponentTypeFiles.forEach((messageComponentTypeFile) => {
		// Check if message component type already exists or should be reloaded anyway
		if (
			forceReload ||
			exclude !== (include && include.includes(messageComponentTypeFile.type)) ||
			!messageComponentTypes.has(messageComponentTypeFile.type)
		) {
			messageComponentTypes.set(messageComponentTypeFile.type, messageComponentTypeFile);
		}
	});

	notify(configuration, "SUCCESS", "Finished updating message component types");
};

export {};
