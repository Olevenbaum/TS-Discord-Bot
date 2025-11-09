// Global imports
import "./fileReader";
import "./notifications";
import { configuration, messageComponentTypes } from "./variables";

// Type imports
import { ComponentType, MessageComponentType } from "discord.js";
import { SavedMessageComponentType } from "../types/components";

declare global {
	/**
	 * Adds new application command types and removes outdated ones or reloads all application command types
	 * @param forceReload Whether to reload all files no matter if files were added or removed
	 */
	function updateMessageComponentTypes(forceReload?: boolean): Promise<void>;

	/**
	 * Reloads the specified application command types or adds them if not already present
	 * @param messageComponentTypes Message component type files to reload, passing an empty array results in the same
	 * behavior as not passing this parameter
	 * @param include Whether to include (`true`) or exclude (`false`) the specified application command types.
	 * Defaults to `true`
	 * @see {@link MessageComponentType}
	 */
	function updateMessageComponentTypes(
		messageComponentTypes?: MessageComponentType[],
		include?: boolean,
	): Promise<void>;
}

global.updateMessageComponentTypes = async function (
	x: boolean | MessageComponentType[] = false,
	include: boolean = true,
) {
	/** Force reload overload parameter */
	const forceReload = typeof x === "boolean" ? x : false;

	/** Message component types overload parameter */
	const types = typeof x === "boolean" || x.length === 0 ? undefined : x;

	notify(
		"INFO",
		`Updating message component type${Array.isArray(types) && types.length === 1 ? " " : "s "}${
			Array.isArray(types)
				? `${types.map((messageComponentType) => `'${ComponentType[messageComponentType]}'`).join(", ")}`
				: ""
		}...`,
	);

	/** List of message component type files */
	const messageComponentTypeFiles = await readFiles<SavedMessageComponentType>(
		configuration.paths.messageComponentTypesPath,
	);

	messageComponentTypes.sweep(
		(_, messageComponentType) =>
			!messageComponentTypeFiles.some(
				(messageComponentTypeFile) => messageComponentTypeFile.type === messageComponentType,
			),
	);

	messageComponentTypeFiles.forEach((messageComponentTypeFile) => {
		if (
			forceReload ||
			(types && types.includes(messageComponentTypeFile.type)) === include ||
			!messageComponentTypes.has(messageComponentTypeFile.type)
		) {
			messageComponentTypes.set(messageComponentTypeFile.type, messageComponentTypeFile);
		}
	});

	notify("SUCCESS", "Finished updating message component types");
};

export {};
