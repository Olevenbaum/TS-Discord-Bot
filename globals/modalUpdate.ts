// Global imports
import "./fileReader";
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
     */
    function updateModals(configuration: Configuration, include?: string[]): Promise<void>;
}

global.updateModals = async function (configuration: Configuration, x: boolean | string[] = false): Promise<void> {
    /**
     * Overload parameter
     */
    const forceReload = typeof x === "boolean" ? x : false;

    /**
     * Overload parameter
     */
    const include = typeof x === "boolean" ? undefined : x;

    /**
     * List of modal files
     */
    const modalFiles = (await readFiles<SavedModal>(configuration, configuration.project.modalsPath)).filter(
        (modalFile) => include?.includes(modalFile.name) ?? true
    );

    // Remove outdated application command types
    modals.sweep(
        (_, modal) =>
            forceReload || (include && include.includes(modal)) || !modals.find((modalFile) => modalFile.name === modal)
    );

    // Iterate through application command types
    modalFiles.forEach((modalFile) => {
        // Check if application command type already exists
        if (!(modalFile.name in modals.keys())) {
            // Set application command type
            modals.set(modalFile.name, modalFile);
        }
    });
};

export {};
