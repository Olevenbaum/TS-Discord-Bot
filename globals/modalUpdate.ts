// Global imports
import "./fileReader";
import "./notifications";
import { modals } from "./variables";

// Type imports
import { Configuration } from "../types/configuration";
import { SavedModal } from "types/modals";

declare global {
    /**
     * Updates all changed modals, adds new ones and deletes removed ones
     * @param configuration The configuration of the project and bot
     * @param forceReload Whether to reload all files no matter if files were changed, added or removed
     */
    function updateModals(configuration: Configuration, forceReload?: boolean): Promise<void>;

    /**
     * Updates all changed modals, adds new ones and deletes removed ones
     * @param configuration The configuration of the project and bot
     * @param include Modal files to reload, passing an empty array results in the same behavior as not passing this
     * parameter
     * @param exclude Whether to include or exclude the specified modal files
     */
    function updateModals(configuration: Configuration, include?: string[], exclude?: boolean): Promise<void>;
}

global.updateModals = async function (
    configuration: Configuration,
    x: boolean | string[] = false,
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
        "info",
        `Updating modal${!Array.isArray(include) || include.length > 1 ? "s" : ""}${
            Array.isArray(include) ? ` ${include.map((modal) => `'${modal}'`).join(", ")}` : ""
        }...`
    );

    /**
     * List of modal files
     */
    const modalFiles = (await readFiles<SavedModal>(configuration, configuration.project.modalsPath)).filter(
        (modalFile) => exclude !== (include?.includes(modalFile.name) ?? true)
    );

    modals.sweep((_, modal) => !modals.find((modalFile) => modalFile.name === modal));

    modalFiles.forEach((modalFile) => {
        // Check if modal already exists
        if (forceReload || exclude !== (include && include.includes(modalFile.name)) || !modals.has(modalFile.name)) {
            modals.set(modalFile.name, modalFile);
        }
    });

    // Notification
    notify(configuration, "success", "Finished updating modals");
};

export {};
