// Class & type imports
import type { SavedModal } from "../../types";

// Data imports
import { configuration, modals } from "#variables";

// Module imports
import readFiles from "../fileReader";
import notify from "../notification";

/**
 * Updates all changed modals, adds new ones and deletes removed ones
 * @param forceReload Whether to reload all modals (defaults to `false`)
 */
export default function (forceReload?: boolean): Promise<void>;

/**
 * Updates all changed modals, adds new ones and deletes removed ones
 * @param modals Modal files to reload, passing an empty array results in the same behavior as not passing this
 * parameter
 * @param exclude Whether to include (`false`) or exclude (`true`) the specified modals (defaults to `false`)
 */
export default function (modals: string[], exclude?: boolean): Promise<void>;

export default async function (x: boolean | string[] = false, exclude: boolean = false) {
	/** Force reload overload parameter */
	const forceReload = typeof x === "boolean" ? x : false;

	/** Modals overload parameter */
	const files = typeof x === "boolean" || x.length === 0 ? undefined : x;

	notify(
		`Updating modal${Array.isArray(files) && files.length === 1 ? "" : "s"}${
			Array.isArray(files) ? ` ${files.map((modal) => `'${modal}'`).join(", ")}` : ""
		}...`,
		"INFORMATION",
	);

	/** List of modal files */
	const modalFiles = (await readFiles<SavedModal>(configuration.paths.modalsPath)).filter(
		(modalFile) => exclude === (files?.includes(modalFile.name) ?? false),
	);

	modals.sweep((_, modal) => !modals.some((modalFile) => modalFile.name === modal));

	modalFiles.forEach((modalFile) => {
		if (forceReload || (files && files.includes(modalFile.name)) !== exclude || !modals.has(modalFile.name)) {
			modals.set(modalFile.name, modalFile);
		}
	});

	notify("Finished updating modals", "SUCCESS");
}
