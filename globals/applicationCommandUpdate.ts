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

    exclude &&= Boolean(include);

    notify(
		configuration,
		"INFO",
		`Updating application command${!Array.isArray(include) || include.length > 1 ? "s" : ""}${
			Array.isArray(include)
				? ` ${include.map((applicationCommand) => `'${applicationCommand}'`).join(", ")}`
				: ""
		}... `,
	);

	/**
	 * List of chat input command files
	 */
	const chatInputCommandFiles = await readFiles<SavedChatInputCommand>(
		configuration,
		configuration.project.chatInputCommandsPath,
	);

	/**
	 * List of message command files
	 */
	const messageCommandFiles = await readFiles<SavedMessageCommand>(
		configuration,
		configuration.project.messageCommandsPath,
	);

	/**
	 * List of chat input command files
	 */
	const userCommandFiles = await readFiles<SavedUserCommand>(configuration, configuration.project.userCommandsPath);

	Object.keys(applicationCommands).forEach((key) => {
		if (!applicationCommands[key as keyof typeof ApplicationCommandType]) {
			return;
		}

		applicationCommands[key as keyof typeof ApplicationCommandType]?.sweep((_, applicationCommandName) => {
			// Check type of application command
			switch (key) {
				// Return whether chat input command is outdated
				case ApplicationCommandType[ApplicationCommandType.ChatInput]:
					return !chatInputCommandFiles.some(
						(chatInputCommandFile) => chatInputCommandFile.data.name === applicationCommandName,
					);
				case ApplicationCommandType[ApplicationCommandType.Message]:
					return !messageCommandFiles.some(
						(messageCommandFile) => messageCommandFile.data.name === applicationCommandName,
					);
				case ApplicationCommandType[ApplicationCommandType.User]:
					return !userCommandFiles.some(
						(userCommandFile) => userCommandFile.data.name === applicationCommandName,
					);
				default:
					return false;
			}
		});
	});

	chatInputCommandFiles.forEach((applicationCommandFile) => {
		if (
			!applicationCommands[
				ApplicationCommandType[applicationCommandFile.type] as keyof typeof ApplicationCommandType
			]
		) {
			return;
		}

		// Check if chat input command already exists
		if (
			forceReload ||
			exclude !==
				(include && include.includes(`${applicationCommandFile.data.name}:${applicationCommandFile.type}`)) ||
			!applicationCommands[
				ApplicationCommandType[applicationCommandFile.type] as keyof typeof ApplicationCommandType
			]?.has(applicationCommandFile.data.name)
		) {
			applicationCommands[
				ApplicationCommandType[applicationCommandFile.type] as keyof typeof ApplicationCommandType
			]?.set(applicationCommandFile.data.name, applicationCommandFile);
		}
	});

	messageCommandFiles.forEach((applicationCommandFile) => {
		if (
			!applicationCommands[
				ApplicationCommandType[applicationCommandFile.type] as keyof typeof ApplicationCommandType
			]
		) {
			return;
		}

		// Check if message command already exists
		if (
			forceReload ||
			exclude !==
				(include && include.includes(`${applicationCommandFile.data.name}:${applicationCommandFile.type}`)) ||
			!applicationCommands[
				ApplicationCommandType[applicationCommandFile.type] as keyof typeof ApplicationCommandType
			]?.has(applicationCommandFile.data.name)
		) {
			applicationCommands[
				ApplicationCommandType[applicationCommandFile.type] as keyof typeof ApplicationCommandType
			]?.set(applicationCommandFile.data.name, applicationCommandFile);
		}
	});

	userCommandFiles.forEach((applicationCommandFile) => {
		if (
			!applicationCommands[
				ApplicationCommandType[applicationCommandFile.type] as keyof typeof ApplicationCommandType
			]
		) {
			return;
		}

		// Check if user command already exists
		if (
			forceReload ||
			exclude !==
				(include && include.includes(`${applicationCommandFile.data.name}:${applicationCommandFile.type}`)) ||
			!applicationCommands[
				ApplicationCommandType[applicationCommandFile.type] as keyof typeof ApplicationCommandType
			]?.has(applicationCommandFile.data.name)
		) {
			applicationCommands[
				ApplicationCommandType[applicationCommandFile.type] as keyof typeof ApplicationCommandType
			]?.set(applicationCommandFile.data.name, applicationCommandFile);
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

		Object.entries(applicationCommands)
			.map(([_, value]) => value)
			.forEach((applicationCommandCollection) => {
				applicationCommandCollection
					.filter(
						(applicationCommand) =>
							exclude !==
							(include?.includes(`${applicationCommand.data.name}:${applicationCommand.type}`) ?? true),
					)
					.forEach((savedApplicationCommand, savedApplicationCommandName) => {
						/**
						 * Registered application command matching the saved application command
						 */
						const registeredApplicationCommand = registeredApplicationCommands.find(
							(registeredApplicationCommand) =>
								registeredApplicationCommand.name === savedApplicationCommandName,
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
									return [key, defaultValues[key as keyof typeof defaultValues]];
								}

								return [key, value];
							}),
							["type", savedApplicationCommand.type],
						]) as ApplicationCommandData;

						if (!registeredApplicationCommand) {
							promises.push(
								client.application.commands
									.create(savedApplicationCommand.data as ApplicationCommandData)
									.then(() => {
										notify(
											configuration,
											"SUCCESS",
											`Added new application command '${savedApplicationCommandName}'`,
											client,
											`I learned a new trick! You can now use the application command '${bold(
												savedApplicationCommandName,
											)}'!`,
											1,
										);
									})
									.catch((error: Error) => {
										notify(
											configuration,
											"ERROR",
											`Failed to reload application command '${savedApplicationCommandName}':\n${error}`,
											client,
											`I tried to learn a new trick, but failed! The application command ${bold(
												savedApplicationCommandName,
											)} could not be loaded:\n${code(error.message)}!`,
											3,
										);
									}),
							);
						} else {
							// Check if application commands are equal
							if (forceReload || !registeredApplicationCommand.equals(savedApplicationCommandData)) {
								promises.push(
									registeredApplicationCommand
										.edit(savedApplicationCommand.data as ApplicationCommandData)
										.then(() => {
											notify(
												configuration,
												"SUCCESS",
												`Updated application command '${savedApplicationCommandName}'`,
												client,
												`I've spent some time training my tricks! The command ${bold(
													savedApplicationCommandName,
												)} just got an update!`,
												1,
											);
										})
										.catch((error: Error) => {
											notify(
												configuration,
												"ERROR",
												`Failed to update application command '${savedApplicationCommandName}':\n${error}`,
												client,
												`I tried to update a trick, but failed! The application command ${bold(
													savedApplicationCommandName,
												)} could not be reloaded:\n${code(error.message)}!`,
												3,
											);
										}),
								);
							}
						}
					});
			});

		registeredApplicationCommands.forEach((registeredApplicationCommand) => {
			if (
				!applicationCommands[
					ApplicationCommandType[registeredApplicationCommand.type] as keyof typeof ApplicationCommandType
				]
			) {
				return;
			}

			if (
				!applicationCommands[
					ApplicationCommandType[registeredApplicationCommand.type] as keyof typeof ApplicationCommandType
				]?.has(registeredApplicationCommand.name)
			) {
				// Check if application command still exists locally
				promises.push(
					registeredApplicationCommand
						.delete()
						.then(() => {
							notify(
								configuration,
								"SUCCESS",
								`Removed deprecated application command '${registeredApplicationCommand.name}'`,
								client,
								`I forgot a trick! The application command ${bold(
									registeredApplicationCommand.name,
								)} is no longer available.`,
								1,
							);
						})
						.catch((error: Error) => {
							notify(
								configuration,
								"ERROR",
								`Failed to remove deprecated application command '${registeredApplicationCommand.name}':\n${error}`,
								client,
								`I tried to forget a trick, but failed! The application command ${bold(
									registeredApplicationCommand.name,
								)} could not be removed:\n${code(error.message)}!`,
								3,
							);
						}),
				);
			}
		});

		await Promise.all(promises)
			.then(() =>
				notify(
					configuration,
					"SUCCESS",
					`Added, deleted and updated ${promises.length} application commands`,
					client,
					`My update was completed! I've added, deleted and updated ${underlined(
						promises.length,
					)} application commands!`,
					1,
				),
			)
			.catch((error: Error) => {
				notify(
					configuration,
					"ERROR",
					`Failed to update application commands:\n${error}`,
					client,
					`I tried to update my tricks, but failed! None of the application commands could be reloaded:\n${code(
						error.message,
					)}!`,
					3,
				);
			});
	}
};

export {};
