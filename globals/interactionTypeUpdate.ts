// Global imports
import "./fileReader";
import "./notifications";
import { configuration, interactionTypes } from "./variables";

// Type imports
import { InteractionType } from "discord.js";
import { SavedInteractionType } from "../types/others";

declare global {
	/**
	 * Adds new interaction types and removes outdated ones or reloads all interaction types
	 * @param forceReload Whether to reload all files no matter if files were added or removed
	 */
	function updateInteractionTypes(forceReload?: boolean): Promise<void>;

	/**
	 * Reloads the specified interaction types or adds them if not already present#
	 * @param interactionTypes Interaction type files to reload, passing an empty array will result in the same
	 * behavior as not passing this parameter
	 * @param include Whether to include (`true`) or exclude (`false`) the specified interaction types. Defaults to
	 * `false`
	 * @see {@link InteractionType}
	 */
	function updateInteractionTypes(
		interactionTypes?: (keyof typeof InteractionType)[],
		include?: boolean,
	): Promise<void>;
}

global.updateInteractionTypes = async function (
	x: boolean | (keyof typeof InteractionType)[] = false,
	include: boolean = true,
) {
	/** Force reload overload parameter */
	const forceReload = typeof x === "boolean" ? x : false;

	/** Interaction types overload parameter */
	const types = typeof x === "boolean" || x.length === 0 ? undefined : x;

	notify(
		"INFO",
		`Updating interaction type${Array.isArray(types) && types.length === 1 ? " " : "s "}${
			Array.isArray(types) ? `${types.map((interactionType) => `'${interactionType}'`).join(", ")}` : ""
		}...`,
	);

	/** List of interaction type files */
	const interactionTypeFiles = await readFiles<SavedInteractionType>(configuration.paths.interactionTypesPath);

	interactionTypes.sweep(
		(_, interactionType) =>
			!interactionTypeFiles.find(
				(interactionTypeFile) => interactionTypeFile.type === InteractionType[interactionType],
			),
	);

	interactionTypeFiles.forEach((interactionTypeFile) => {
		if (
			forceReload ||
			(types && types.includes(InteractionType[interactionTypeFile.type] as keyof typeof InteractionType)) ===
				include ||
			!interactionTypes.has(InteractionType[interactionTypeFile.type] as keyof typeof InteractionType)
		) {
			interactionTypes.set(
				InteractionType[interactionTypeFile.type] as keyof typeof InteractionType,
				interactionTypeFile,
			);
		}
	});

	notify("SUCCESS", `Finished updating interaction types`);
};

export {};
