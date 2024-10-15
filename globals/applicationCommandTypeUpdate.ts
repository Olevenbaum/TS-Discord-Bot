// Global imports
import "./fileReader";
import "./notifications";
import { applicationCommandTypes } from "./variables";

// Type imports
import { ApplicationCommandType } from "discord.js";
import { SavedApplicationCommandType } from "../types/applicationCommands";
import { Configuration } from "../types/configuration";

declare global {
    /**
     * Adds new application command types and removes outdated ones or reloads all application command types
     * @param configuration The configuration of the project and bot
     * @param forceReload Whether to reload all files no matter if files were added or removed
     */
    function updateApplicationCommandTypes(configuration: Configuration, forceReload?: boolean): Promise<void>;

    /**
     * Reloads the specified application command types or adds them if not already present
     * @param configuration The configuration of the project and bot
     * @param include Application command type files to reload, passing an empty array results in the same behavior as
     * not passing this parameter
     * @param exclude Whether to include or exclude the specified application command types
     */
    function updateApplicationCommandTypes(
        configuration: Configuration,
        include?: ApplicationCommandType[],
        exclude?: boolean
    ): Promise<void>;
}

global.updateApplicationCommandTypes = async function (
    configuration: Configuration,
    x: boolean | ApplicationCommandType[] = false,
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
        `Updating application command type${!Array.isArray(include) || include.length > 1 ? "s" : ""}${
            Array.isArray(include)
                ? ` ${include
                      .map((applicationCommandType) => `'${ApplicationCommandType[applicationCommandType]}'`)
                      .join(", ")}`
                : ""
        }...`
    );

    /**
     * List of application command type files
     */
    const applicationCommandTypeFiles = await readFiles<SavedApplicationCommandType>(
        configuration,
        configuration.project.applicationCommandTypesPath
    );

    applicationCommandTypes.sweep(
        (_, applicationCommandType) =>
            !applicationCommandTypeFiles.some(
                (applicationCommandTypeFile) => applicationCommandTypeFile.type === applicationCommandType
            )
    );

    applicationCommandTypeFiles.forEach((applicationCommandTypeFile) => {
        // Check if application command type already exists or should be reloaded anyway
        if (
            forceReload ||
            exclude !== (include && include.includes(applicationCommandTypeFile.type)) ||
            !applicationCommandTypes.has(applicationCommandTypeFile.type)
        ) {
            applicationCommandTypes.set(applicationCommandTypeFile.type, applicationCommandTypeFile);
        }
    });

    notify(configuration, "success", "Finished updating application command types");
};

export {};
