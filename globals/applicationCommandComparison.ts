// Type imports
import {
    APIApplicationCommandOption,
    ApplicationCommand,
    ApplicationCommandOption,
    Client,
    ToAPIApplicationCommandOptions,
} from "discord.js";
import { SavedApplicationCommand } from "../types/applicationCommands";

declare global {
    /**
     * Compares a registered application command with a saved application command
     * @param registeredApplicationCommand The registered application command
     * @param savedApplicationCommand The saved application command
     * @param client The Discord bot client
     * @returns Whether the application commands are equal
     */
    function compareApplicationCommands(
        registeredApplicationCommand: ApplicationCommand,
        savedApplicationCommand: SavedApplicationCommand,
        client: Client<true>
    ): boolean;
}

const transformApplicationCommandOptions = function (
    applicationCommandOptions:
        | (ApplicationCommandOption & {
              nameLocalized?: string | undefined;
              descriptionLocalized?: string | undefined;
          })[]
        | ToAPIApplicationCommandOptions[]
): APIApplicationCommandOption[] {};

global.compareApplicationCommands = function (
    registeredApplicationCommand: ApplicationCommand,
    savedApplicationCommand: SavedApplicationCommand,
    client: Client<true>
): boolean {
    /**
     * Default values and values that cannot be present in the saved application command
     */
    const defaultValues = {
        application_id: client.application.id,
        contexts: null,
        default_member_permissions: null,
        id: registeredApplicationCommand.id,
        type: savedApplicationCommand.type,
        nsfw: false,
        version: registeredApplicationCommand.version,
    };

    Object.keys(registeredApplicationCommand).forEach((key) => {
        if (!(key in savedApplicationCommand.data)) {
            savedApplicationCommand.data[key] = defaultValues[key];
        }
        switch (key) {
            case "options":
                if (
                    transformApplicationCommandOptions(registeredApplicationCommand[key]) !=
                    transformApplicationCommandOptions(savedApplicationCommand.data[key])
                ) {
                    return false;
                }
            default:
                if (registeredApplicationCommand[key] != savedApplicationCommand.data[key]) {
                    return false;
                }
        }
    });

    return true;
};

export {};
