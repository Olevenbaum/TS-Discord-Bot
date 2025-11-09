// Global imports
import "./fileReader";
import "./notifications";
import { configuration, modals } from "./variables";

// Type imports
import { SavedModal } from "../types/modals";

declare global {
	/**
	 * Updates all changed modals, adds new ones and deletes removed ones
	 * @param forceReload Whether to reload all files no matter if files were changed, added or removed
	 * @see {@link Configuration}
	 */
	function updateModals(forceReload?: boolean): Promise<void>;

	/**
	 * Updates all changed modals, adds new ones and deletes removed ones
	 * @param modals Modal files to reload, passing an empty array results in the same behavior as not passing this
	 * parameter
	 * @param include Whether to include (`true`) or exclude (`false`) the specified modal files. Defaults to `true`
	 */
	function updateModals(modals?: string[], include?: boolean): Promise<void>;
}

global.updateModals = async function (x: boolean | string[] = false, include: boolean = true) {
	/** Force reload overload parameter */
	const forceReload = typeof x === "boolean" ? x : false;

	/** Modals overload parameter */
	const files = typeof x === "boolean" || x.length === 0 ? undefined : x;

	notify(
		"INFO",
		`Updating modal${Array.isArray(files) && files.length === 1 ? "" : "s"}${
			Array.isArray(files) ? ` ${files.map((modal) => `'${modal}'`).join(", ")}` : ""
		}...`,
	);

	/** List of modal files */
	const modalFiles = (await readFiles<SavedModal>(configuration.paths.modalsPath)).filter(
		(modalFile) => include !== (files?.includes(modalFile.name) ?? true),
	);

	modals.sweep((_, modal) => !modals.some((modalFile) => modalFile.name === modal));

	modalFiles.forEach((modalFile) => {
		if (forceReload || (files && files.includes(modalFile.name)) === include || !modals.has(modalFile.name)) {
			modals.set(modalFile.name, modalFile);
		}
	});

	notify("SUCCESS", "Finished updating modals");
};

export {};
