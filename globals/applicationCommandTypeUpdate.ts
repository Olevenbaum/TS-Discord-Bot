// Global imports
import "./fileReader";
import { applicationCommandTypes } from "./variables";

// Type imports
import { ApplicationCommandType } from "discord.js";
import { SavedApplicationCommandType } from "../types/applicationCommands";
import { Configuration } from "../types/configuration";

declare global {
    /**
     * Updates all changed application command types, adds new ones and deletes removed ones
     * @param configuration The configuration of the project and bot
     * @param forceReload Whether to reload all files no matter if files were changed, added or removed
     */
    function updateApplicationCommandTypes(configuration: Configuration, forceReload?: boolean): Promise<void>;

    /**
     * Updates all changed application command types, adds new ones and deletes removed ones
     * @param configuration The configuration of the project and bot
     * @param include Application command type files to reload, passing an empty array results in the same behavior as
     * not passing this parameter
     */
    function updateApplicationCommandTypes(
        configuration: Configuration,
        include?: ApplicationCommandType[]
    ): Promise<void>;
}

global.updateApplicationCommandTypes = async function (
    configuration: Configuration,
    x: boolean | ApplicationCommandType[] = false
): Promise<void> {
    /**
     * Overload parameter
     */
    const forceReload = typeof x === "boolean" ? x : false;

    /**
     * Overload parameter
     */
    const include = typeof x === "boolean" ? undefined : x;

    /**
     * List of application command type files
     */
    const applicationCommandTypeFiles = (
        await readFiles<SavedApplicationCommandType>(configuration, configuration.project.applicationCommandTypesPath)
    ).filter((applicationCommandTypeFile) => include?.includes(applicationCommandTypeFile.type) ?? true);

    // Remove outdated application command types
    applicationCommandTypes.sweep(
        (_, applicationCommandType) =>
            forceReload ||
            (include && include.includes(applicationCommandType)) ||
            !applicationCommandTypeFiles.find(
                (applicationCommandTypeFile) => applicationCommandTypeFile.type === applicationCommandType
            )
    );

    // Iterate through application command types
    applicationCommandTypeFiles.forEach((applicationCommandTypeFile) => {
        // Check if application command type already exists
        if (!(applicationCommandTypeFile.type in applicationCommandTypes.keys())) {
            // Set application command type
            applicationCommandTypes.set(applicationCommandTypeFile.type, applicationCommandTypeFile);
        }
    });
};

export {};
