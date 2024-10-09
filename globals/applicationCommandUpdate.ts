// Global imports
import "./discordTextFormat";
import "./fileReader";
import "./notifications";
import { applicationCommands } from "./variables";

// Type imports
import { ApplicationCommandData, ApplicationCommandType, Client } from "discord.js";
import { SavedChatInputCommand, SavedMessageCommand, SavedUserCommand } from "../types/applicationCommands";
import { Configuration } from "../types/configuration";

declare global {
    /**
     * Updates all changed application commands, adds new ones and deletes removed ones and updates the registered
     * application commands
     * @param configuration The configuration of the project and bot
     * @param client The Discord bot client to register the application commands to
     * @param forceReload Whether to reload all files no matter if files were changed, new files added or old files
     * removed, defaults to false
     */
    function updateApplicationCommands(
        configuration: Configuration,
        client?: Client<true>,
        forceReload?: boolean
    ): Promise<void>;

    /**
     * Updates all changed application commands, adds new ones and deletes removed ones and updates the registered
     * application commands
     * @param configuration The configuration of the project and bot
     * @param client The Discord bot client to register the application commands to
     * @param include Application commands that should be reloaded, passing an empty array results in the same
     * behavior as not passing this parameter
     * @param exclude Whether to include or exclude the specified application commands
     */
    function updateApplicationCommands(
        configuration: Configuration,
        client?: Client<true>,
        include?: `${string}:${ApplicationCommandType}`[],
        exclude?: boolean
    ): Promise<void>;
}

global.updateApplicationCommands = async function (
    configuration: Configuration,
    client?: Client<true>,
    x: boolean | `${string}:${ApplicationCommandType}`[] = false,
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

    // Overwrite exlude parameter if include is empty
    exclude &&= Boolean(include);

    // Interaction response
    notify(
        configuration,
        "info",
        `Updating application command${!Array.isArray(include) || include.length > 1 ? "s" : ""}${
            Array.isArray(include)
                ? ` ${include.map((applicationCommand) => `'${applicationCommand}'`).join(", ")}`
                : ""
        }... `
    );

    /**
     * List of chat input command files
     */
    const chatInputCommandFiles = await readFiles<SavedChatInputCommand>(
        configuration,
        configuration.project.chatInputCommandsPath
    );

    /**
     * List of message command files
     */
    const messageCommandFiles = await readFiles<SavedMessageCommand>(
        configuration,
        configuration.project.messageCommandsPath
    );

    /**
     * List of chat input command files
     */
    const userCommandFiles = await readFiles<SavedUserCommand>(configuration, configuration.project.userCommandsPath);

    // Remove all outdated application commands
    Object.keys(applicationCommands).forEach((key) => {
        applicationCommands[key as keyof typeof ApplicationCommandType].sweep((_, applicationCommandName) => {
            // Check type of application command
            switch (key) {
                // Return whether chat input command is outdated
                case ApplicationCommandType[ApplicationCommandType.ChatInput]:
                    return !chatInputCommandFiles.some(
                        (chatInputCommandFile) => chatInputCommandFile.data.name === applicationCommandName
                    );
                case ApplicationCommandType[ApplicationCommandType.Message]:
                    // Return whether message command is outdated
                    return !messageCommandFiles.some(
                        (messageCommandFile) => messageCommandFile.data.name === applicationCommandName
                    );
                case ApplicationCommandType[ApplicationCommandType.User]:
                    // Return whether user command is outdated
                    return !userCommandFiles.some(
                        (userCommandFile) => userCommandFile.data.name === applicationCommandName
                    );
                default:
                    // Return false for unknown application command types
                    return false;
            }
        });
    });

    // Iterate through chat input commands
    chatInputCommandFiles.forEach((applicationCommandFile) => {
        // Check if chat input command already exists
        if (
            forceReload ||
            exclude !==
                (include && include.includes(`${applicationCommandFile.data.name}:${applicationCommandFile.type}`)) ||
            !applicationCommands[
                ApplicationCommandType[applicationCommandFile.type] as keyof typeof ApplicationCommandType
            ].has(applicationCommandFile.data.name)
        ) {
            // Set chat input command
            applicationCommands[
                ApplicationCommandType[applicationCommandFile.type] as keyof typeof ApplicationCommandType
            ].set(applicationCommandFile.data.name, applicationCommandFile);
        }
    });

    // Iterate through message commands
    messageCommandFiles.forEach((applicationCommandFile) => {
        // Check if message command already exists
        if (
            forceReload ||
            exclude !==
                (include && include.includes(`${applicationCommandFile.data.name}:${applicationCommandFile.type}`)) ||
            !applicationCommands[
                ApplicationCommandType[applicationCommandFile.type] as keyof typeof ApplicationCommandType
            ].has(applicationCommandFile.data.name)
        ) {
            // Set message command
            applicationCommands[
                ApplicationCommandType[applicationCommandFile.type] as keyof typeof ApplicationCommandType
            ].set(applicationCommandFile.data.name, applicationCommandFile);
        }
    });

    // Iterate through user commands
    userCommandFiles.forEach((applicationCommandFile) => {
        // Check if user command already exists
        if (
            forceReload ||
            exclude !==
                (include && include.includes(`${applicationCommandFile.data.name}:${applicationCommandFile.type}`)) ||
            !applicationCommands[
                ApplicationCommandType[applicationCommandFile.type] as keyof typeof ApplicationCommandType
            ].has(applicationCommandFile.data.name)
        ) {
            // Set user command
            applicationCommands[
                ApplicationCommandType[applicationCommandFile.type] as keyof typeof ApplicationCommandType
            ].set(applicationCommandFile.data.name, applicationCommandFile);
        }
    });

    // Check whether to update registered application commands
    if (client) {
        /**
         * Registered application commands
         */
        const registeredApplicationCommands = await client.application.commands.fetch();

        /**
         * Default values of a saved application command
         */
        const defaultValues = {
            contexts: null,
            default_member_permissions: null,
            integration_types: client.application.integrationTypesConfig
                ? Object.keys(client.application.integrationTypesConfig).map((key) => parseInt(key))
                : [],
            nsfw: false,
        };

        /**
         * Promises to send to Discord API
         */
        const promises: Promise<unknown>[] = [];

        // Iterate over application commands
        Object.entries(applicationCommands)
            .map(([_, value]) => value)
            .forEach((applicationCommandCollection) => {
                applicationCommandCollection
                    .filter(
                        (applicationCommand) =>
                            exclude !==
                            (include?.includes(`${applicationCommand.data.name}:${applicationCommand.type}`) ?? true)
                    )
                    .forEach((savedApplicationCommand, savedApplicationCommandName) => {
                        /**
                         * Registered application command matching the saved application command
                         */
                        const registeredApplicationCommand = registeredApplicationCommands.find(
                            (registeredApplicationCommand) =>
                                registeredApplicationCommand.name === savedApplicationCommandName
                        );

                        /**
                         * Data of the saved application command with added default values
                         */
                        const savedApplicationCommandData = Object.fromEntries([
                            ...Object.entries(savedApplicationCommand.data).map(([key, value]) => {
                                // Check if value was set
                                if (
                                    (typeof value === "undefined" || (Array.isArray(value) && value.length === 0)) &&
                                    key in defaultValues
                                ) {
                                    // Return default value
                                    return [key, defaultValues[key as keyof typeof defaultValues]];
                                }

                                // Return key value pair
                                return [key, value];
                            }),

                            // Add application command type
                            ["type", savedApplicationCommand.type],
                        ]) as ApplicationCommandData;

                        if (!registeredApplicationCommand) {
                            // Add create request to promises
                            promises.push(
                                client.application.commands
                                    .create(savedApplicationCommand.data as ApplicationCommandData)
                                    .then(() => {
                                        // Notification
                                        notify(
                                            configuration,
                                            "success",
                                            `Added new application command '${savedApplicationCommandName}'`,
                                            client,
                                            `I learned a new trick! You can now use the application command '${bold(
                                                savedApplicationCommandName
                                            )}'!`
                                        );
                                    })
                                    .catch((error: Error) => {
                                        // Notification
                                        notify(
                                            configuration,
                                            "error",
                                            `Failed to reload application command '${savedApplicationCommandName}':\n${error}`,
                                            client,
                                            `I tried to learn a new trick, but failed! The application command ${bold(
                                                savedApplicationCommandName
                                            )} could not be loaded:\n${code(error.message)}!`
                                        );
                                    })
                            );
                        } else {
                            // Check if application commands are equal
                            if (forceReload || !registeredApplicationCommand.equals(savedApplicationCommandData)) {
                                // Add update request to promises
                                promises.push(
                                    registeredApplicationCommand
                                        .edit(savedApplicationCommand.data as ApplicationCommandData)
                                        .then(() => {
                                            // Notification
                                            notify(
                                                configuration,
                                                "success",
                                                `Updated application command '${savedApplicationCommandName}'`,
                                                client,
                                                `I've spent some time training my tricks! The command ${bold(
                                                    savedApplicationCommandName
                                                )} just got an update!`
                                            );
                                        })
                                        .catch((error: Error) => {
                                            // Notification
                                            notify(
                                                configuration,
                                                "error",
                                                `Failed to update application command '${savedApplicationCommandName}':\n${error}`,
                                                client,
                                                `I tried to update a trick, but failed! The application command ${bold(
                                                    savedApplicationCommandName
                                                )} could not be reloaded:\n${code(error.message)}!`
                                            );
                                        })
                                );
                            }
                        }
                    });
            });

        // Iterate over registered application commands
        registeredApplicationCommands.forEach((registeredApplicationCommand) => {
            // Check if application command still exists locally
            if (
                !applicationCommands[
                    ApplicationCommandType[registeredApplicationCommand.type] as keyof typeof ApplicationCommandType
                ].has(registeredApplicationCommand.name)
            ) {
                // Add delete request to promises
                registeredApplicationCommand
                    .delete()
                    .then(() => {
                        // Notification
                        notify(
                            configuration,
                            "success",
                            `Removed deprecated application command '${registeredApplicationCommand.name}'`,
                            client,
                            `I forgot a trick! The application command ${bold(
                                registeredApplicationCommand.name
                            )} is no longer available.`
                        );
                    })
                    .catch((error: Error) => {
                        // Notification
                        notify(
                            configuration,
                            "error",
                            `Failed to remove deprecated application command '${registeredApplicationCommand.name}':\n${error}`,
                            client,
                            `I tried to forget a trick, but failed! The application command ${bold(
                                registeredApplicationCommand.name
                            )} could not be removed:\n${code(error.message)}!`
                        );
                    });
            }
        });

        // Wait for all promises to resolve
        await Promise.all(promises).catch((error: Error) => {
            // Notification
            notify(
                configuration,
                "error",
                `Failed to update application commands:\n${error}`,
                client,
                `I tried to update my tricks, but failed! None of the application commands could be reloaded:\n${code(
                    error.message
                )}!`
            );
        });

        // Notification
        notify(
            configuration,
            "success",
            `Added, deleted and updated ${promises.length} application commands`,
            client,
            `My update was completed! I've added, deleted and updated ${underlined(
                promises.length
            )} application commands!`
        );
    }
};

export {};
