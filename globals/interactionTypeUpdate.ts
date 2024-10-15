// Global imports
import "./fileReader";
import "./notifications";
import { interactionTypes } from "./variables";

// Type imports
import { InteractionType } from "discord.js";
import { Configuration } from "../types/configuration";
import { SavedInteractionType } from "../types/others";

declare global {
    /**
     * Adds new interaction types and removes outdated ones or reloads all interaction types
     * @param configuration The configuration of the project and bot
     * @param forceReload Whether to reload all files no matter if files were added or removed
     */
    function updateInteractionTypes(configuration: Configuration, forceReload?: boolean): Promise<void>;

    /**
     * Reloads the specified interaction types or adds them if not already present
     * @param configuration The configuration of the project and bot
     * @param include Interaction type files to reload, passing an empty array will result in the same behavior as not
     * passing this parameter
     * @param exclude Whether to include or exclude the specified interaction types
     */
    function updateInteractionTypes(
        configuration: Configuration,
        include?: InteractionType[],
        exclude?: boolean
    ): Promise<void>;
}

global.updateInteractionTypes = async function (
    configuration: Configuration,
    x: boolean | InteractionType[] = false,
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
        `Updating interaction type${!Array.isArray(include) || include.length > 1 ? "s" : ""}${
            Array.isArray(include)
                ? ` ${include.map((interactionType) => `'${InteractionType[interactionType]}'`).join(", ")}`
                : ""
        }...`
    );

    /**
     * List of interaction type files
     */
    const interactionTypeFiles = await readFiles<SavedInteractionType>(
        configuration,
        configuration.project.interactionTypesPath
    );

    interactionTypes.sweep(
        (_, interactionType) =>
            !interactionTypeFiles.find((interactionTypeFile) => interactionTypeFile.type === interactionType)
    );

    interactionTypeFiles.forEach((interactionTypeFile) => {
        // Check if interaction type already exists or should be reloaded anyway
        if (
            forceReload ||
            exclude !== (include && include.includes(interactionTypeFile.type)) ||
            !interactionTypes.has(interactionTypeFile.type)
        ) {
            interactionTypes.set(interactionTypeFile.type, interactionTypeFile);
        }
    });

    notify(configuration, "success", `Finished updating interaction types`);
};

export {};
