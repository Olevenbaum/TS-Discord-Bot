// Class & type imports
import type { SavedInteractionType } from "../../types";

// Data imports
import { configuration, interactionTypes } from "#variables";

// External libraries imports
import { InteractionType } from "discord.js";

// Module imports
import readFiles from "../fileReader";
import notify from "../notification";

/**
 * Iterates all files in the interaction type directories. If files were deleted, the matching interaction types are
 * removed from the collection. If files were added the matching interaction types are added to the collection. On force
 * reload remaining interaction types are reloaded from the matching files.
 * @param forceReload - Whether to reload all existing interaction types (defaults to `false`)
 */
export default async function updateInteractionTypes(forceReload?: boolean): Promise<void>;

/**
 * Iterates all files in the interaction type directories. If files were deleted, the matching interaction types are
 * removed from the collection. If files were added the matching interaction types are added to the collection. Any
 * specified interaction types are either reloaded or excluded from reloading.
 * @param interactionTypes Interaction types to reload or exclude from reloading
 * @param exclude Whether to include (`false`) or exclude (`true`) the specified interaction types (defaults to `false`)
 * @see {@link InteractionType}
 */
export default async function updateInteractionTypes(
	interactionTypes: InteractionType[] | (keyof typeof InteractionType)[],
	exclude?: boolean,
): Promise<void>;

export default async function updateInteractionTypes(
	x: boolean | InteractionType[] | (keyof typeof InteractionType)[] = false,
	exclude: boolean = false,
) {
	/** Force reload overload parameter */
	const forceReload = typeof x === "boolean" ? x : false;

	/** Interaction types overload parameter */
	const types =
		typeof x === "boolean" || x.length === 0
			? undefined
			: x.every((interactionType) => typeof interactionType === "string")
			? x.map((interactionType) => InteractionType[interactionType])
			: x;

	notify(
		`Updating interaction type${Array.isArray(types) && types.length === 1 ? "" : "s"}${
			Array.isArray(types)
				? ` ${types.map((interactionType) => `'${InteractionType[interactionType]}'`).join(", ")}`
				: ""
		}...`,
		"INFORMATION",
	);

	/** List of interaction type files */
	const interactionTypeFiles = await readFiles<SavedInteractionType>(configuration.paths.interactionTypesPath);

	if (!types || exclude) {
		interactionTypes.sweep(
			(_, interactionType) =>
				!interactionTypeFiles.find(
					(interactionTypeFile) => interactionTypeFile.type === InteractionType[interactionType],
				),
		);
	}

	interactionTypeFiles.forEach((interactionTypeFile) => {
		if (
			forceReload ||
			(types && types.includes(interactionTypeFile.type)) !== exclude ||
			!interactionTypes.has(InteractionType[interactionTypeFile.type] as keyof typeof InteractionType)
		) {
			interactionTypes.set(
				InteractionType[interactionTypeFile.type] as keyof typeof InteractionType,
				interactionTypeFile,
			);
		}
	});

	notify("Finished updating interaction types", "SUCCESS");
}
