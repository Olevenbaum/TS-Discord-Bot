// Class & type imports
import type { SavedMessageComponentType } from "../../types";

// Data imports
import { componentTypes, configuration } from "#variables";

// External libraries imports
import { ComponentType } from "discord.js";

// Module imports
import readFiles from "../fileReader";
import notify from "../notification";

/**
 * Iterates all files in the component type directories. If files were deleted, the matching component types are removed
 * from the collection. If files were added the matching component types are added to the collection. On force reload
 * remaining component types are reloaded from the matching files.
 * @param forceReload - Whether to reload all existing component types (defaults to `false`)
 */
export default async function updateComponentTypes(forceReload?: boolean): Promise<void>;

/**
 * Iterates all files in the component type directories. If files were deleted, the matching component types are removed
 * from the collection. If files were added the matching component types are added to the collection. Any specified
 * component types are either reloaded or excluded from reloading.
 * @param componentTypes - Component types to reload or exclude from reloading
 * @param exclude - Whether to include (`false`) or exclude (`true`) the specified component types (defaults to `false`)
 * @see {@link ComponentType}
 */
export default async function updateComponentTypes(
	componentTypes: ComponentType[] | (keyof typeof ComponentType)[],
	exclude?: boolean,
): Promise<void>;

export default async function updateComponentTypes(
	x: boolean | ComponentType[] | (keyof typeof ComponentType)[] = false,
	exclude: boolean = false,
) {
	/** Force reload overload parameter */
	const forceReload = typeof x === "boolean" ? x : false;

	/** Component types overload parameter */
	const types =
		typeof x === "boolean" || x.length === 0
			? undefined
			: x.every((componentType) => typeof componentType === "string")
			? x.map((componentType) => ComponentType[componentType])
			: x;

	notify(
		`Updating component type${Array.isArray(types) && types.length === 1 ? "" : "s"}${
			Array.isArray(types)
				? ` ${types.map((messageComponentType) => `'${ComponentType[messageComponentType]}'`).join(", ")}`
				: ""
		}...`,
		"INFORMATION",
	);

	/** List of message component type files */
	const componentTypeFiles = await readFiles<SavedMessageComponentType>(configuration.paths.componentTypesPath);

	if (!types || exclude) {
		componentTypes.sweep(
			(_, componentType) =>
				!componentTypeFiles.some((componentTypeFile) => componentTypeFile.type === componentType),
		);
	}

	componentTypeFiles.forEach((componentTypeFile) => {
		if (
			forceReload ||
			(types && types.includes(componentTypeFile.type)) !== exclude ||
			!componentTypes.has(componentTypeFile.type)
		) {
			componentTypes.set(componentTypeFile.type, componentTypeFile);
		}
	});

	notify("Finished updating component types", "SUCCESS");
}
