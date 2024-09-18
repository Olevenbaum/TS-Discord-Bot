// Global imports
// import "./applicationCommandComparison"; TODO
import "./discordTextFormat";
import "./fileReader";
import "./notifications";
import { applicationCommands } from "./variables";

// Type imports
import { ApplicationCommand, Client, Collection, Routes } from "discord.js";
import { SavedApplicationCommand } from "../types/applicationCommands";
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
    ): void;

    /**
     * Updates all changed application commands, adds new ones and deletes removed ones and updates the registered
     * application commands
     * @param configuration The configuration of the project and bot
     * @param client The Discord bot client to register the application commands to
     * @param include Application commands that should be reloaded, passing an empty array results in the same
     * behavior as not passing this parameter
     */
    function updateApplicationCommands(configuration: Configuration, client?: Client<true>, include?: string[]): void;
}

global.updateApplicationCommands = async function (
    configuration: Configuration,
    client?: Client<true>,
    x: boolean | string[] = false
) {
    /**
     * Overload parameter
     */
    const forceReload = typeof x === "boolean" ? x : false;

    /**
     * Overload parameter
     */
    const include = typeof x === "boolean" || x.length === 0 ? undefined : x;

    /**
     * List of application command files
     */
    const applicationCommandFiles = (
        await readFiles<SavedApplicationCommand>(configuration, configuration.project.applicationCommandsPath)
    ).filter((applicationCommandFile) => include?.includes(applicationCommandFile.data.name) ?? true);

    // Remove outdated application commands
    applicationCommands.sweep(
        (_, applicationCommandName) =>
            forceReload ||
            (include && include.includes(applicationCommandName)) ||
            !applicationCommandFiles.find(
                (applicationCommandFile) => applicationCommandFile.data.name === applicationCommandName
            )
    );

    // Iterate through application commands
    for (const applicationCommand of applicationCommandFiles) {
        // Check if application command already exists
        if (!(applicationCommand.data.name in applicationCommands.keys())) {
            // Set application command
            applicationCommands.set(applicationCommand.data.name, applicationCommand);
        }
    }

    // Check whether to update registered application commands
    if (client) {
        /**
         * Registered application commands
         */
        const registeredApplicationCommands = new Collection(
            ((await client.rest.get(Routes.applicationCommands(client.application.id))) as ApplicationCommand[]).map(
                (registeredApplicationCommand) => [registeredApplicationCommand.name, registeredApplicationCommand]
            )
        );

        /**
         * Promises to send to Discord API
         */
        const promises: Promise<unknown>[] = [];

        // Iterate over application commands
        applicationCommands.forEach((savedApplicationCommand, savedApplicationCommandName) => {
            /**
             * Registered application command matching the saved application command
             */
            const registeredApplicationCommand = registeredApplicationCommands.get(savedApplicationCommandName);

            if (!registeredApplicationCommand) {
                // Add create request to promises
                promises.push(
                    client.rest
                        .post(Routes.applicationCommands(client.application.id), {
                            body: savedApplicationCommand.data.toJSON(),
                        })
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
                                `Failed to reload application command '${savedApplicationCommandName}':\n${error.message}`,
                                client,
                                `I tried to learn the new trick, but failed! The application command ${bold(
                                    savedApplicationCommandName
                                )} could not be loaded:\n${code(error.message)}!`
                            );
                        })
                );
            } else if (
                forceReload ||
                true // TODO
                //!compareApplicationCommands(
                //    registeredApplicationCommand,
                //    savedApplicationCommand
                //)
            ) {
                // Add update request to promises
                promises.push(
                    client.rest
                        .patch(Routes.applicationCommand(client.application.id, registeredApplicationCommand.id), {
                            body: savedApplicationCommand.data.toJSON(),
                        })
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
                                `Failed to update application command '${savedApplicationCommandName}':\n${error.message}`,
                                client,
                                `I tried to update the trick, but failed! The application command ${bold(
                                    savedApplicationCommandName
                                )} could not be reloaded:\n${code(error.message)}!`
                            );
                        })
                );
            }
        });

        // Iterate over registered application commands
        registeredApplicationCommands.forEach((registeredApplicationCommand, registeredApplicationCommandName) => {
            // Check if application command still exists locally
            if (!applicationCommands.has(registeredApplicationCommandName)) {
                // Add delete request to promises
                promises.push(
                    client.rest
                        .delete(Routes.applicationCommand(client.application.id, registeredApplicationCommand.id))
                        .then(() => {
                            // Notification
                            notify(
                                configuration,
                                "success",
                                `Removed deprecated application command '${registeredApplicationCommandName}'`,
                                client,
                                `I forgot a trick! The application command ${bold(
                                    registeredApplicationCommandName
                                )} is no longer available.`
                            );
                        })
                        .catch((error: Error) => {
                            // Notification
                            notify(
                                configuration,
                                "error",
                                `Failed to remove deprecated application command '${registeredApplicationCommandName}':\n${error.message}`,
                                client,
                                `I tried to forget the trick, but failed! The application command ${bold(
                                    registeredApplicationCommandName
                                )} could not be removed:\n${code(error.message)}!`
                            );
                        })
                );
            }
        });

        // Wait for all promises to resolve
        await Promise.all(promises).catch((error: Error) => {
            // Notification
            notify(
                configuration,
                "error",
                `Failed to update application commands:\n${error.message}`,
                client,
                `I tried to update my tricks, but failed! None of the application commands could be reloaded:\n${code(
                    error.message
                )}!`
            );
        });

        // Check whether there were any updates
        if (promises.length > 0) {
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
        } else {
            // Notification
            notify(
                configuration,
                "info",
                "Found no application commands to add, delete or update",
                client,
                "I'm up to date, no application commands were added, deleted or updated!"
            );
        }
    }
};

export {};
