// Global imports
import "./fileReader";
import { interactionTypes } from "./variables";

// Type imports
import { InteractionType } from "discord.js";
import { Configuration } from "../types/configuration";
import { SavedInteractionType } from "../types/interfaces";

declare global {
    /**
     * Updates all changed interaction types, adds new ones and deletes removed ones
     * @param configuration The configuration of the project and bot
     * @param forceReload Whether to reload all files no matter if files were changed, added or removed
     */
    function updateInteractionTypes(configuration: Configuration, forceReload?: boolean): Promise<void>;

    /**
     * Updates all changed interaction types, adds new ones and deletes removed ones
     * @param configuration The configuration of the project and bot
     * @param include Interaction type files to reload, passing an empty array will result in the same behavior as not
     * passing this parameter
     */
    function updateInteractionTypes(configuration: Configuration, include?: InteractionType[]): Promise<void>;
}

global.updateInteractionTypes = async function (
    configuration: Configuration,
    x: boolean | InteractionType[] = false
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
     * List of interaction type files
     */
    const interactionTypeFiles = (
        await readFiles<SavedInteractionType>(configuration, configuration.project.interactionTypesPath)
    ).filter((interactionTypeFile) => include?.includes(interactionTypeFile.type) ?? true);

    // Remove outdated interaction types
    interactionTypes.sweep(
        (_, interactionType) =>
            forceReload ||
            (include && include.includes(interactionType)) ||
            !interactionTypeFiles.find((interactionTypeFile) => interactionTypeFile.type === interactionType)
    );

    // Iterate through interaction types
    interactionTypeFiles.forEach((interactionTypeFile) => {
        // Check if interaction type already exists
        if (!(interactionTypeFile.type in interactionTypes.keys())) {
            // Set interaction type
            interactionTypes.set(interactionTypeFile.type, interactionTypeFile);
        }
    });
};

export {};
