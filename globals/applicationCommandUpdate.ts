// Global imports
import "./discordTextFormat";
import "./fileReader";
import "./notifications";
import { applicationCommands as savedApplicationCommands, configuration } from "./variables";

// Type imports
import { ApplicationCommandData, ApplicationCommandType, Client } from "discord.js";
import { SavedChatInputCommand, SavedMessageCommand, SavedUserCommand } from "../types/applicationCommands";
import { Task } from "../types/others";

declare global {
	/**
	 * Updates all changed application commands, adds new ones and deletes removed ones and updates the registered
	 * application commands
	 * @param client The Discord bot client to register the application commands to
	 * @param forceReload Whether to reload all files no matter if files were changed, new files added or old files
	 * removed, defaults to false
	 * @see {@link Client}
	 */
	function updateApplicationCommands(client?: Client<true>, forceReload?: boolean): Promise<void>;

	/**
	 * Updates all changed application commands, adds new ones and deletes removed ones and updates the registered
	 * application commands
	 * @param client The Discord bot client to register the application commands to
	 * @param applicationCommands Application commands that should be reloaded, passing an object with empty arrays
	 * only results in the same behavior as not passing this parameter
	 * @param include Whether to include (`true`) or exclude (`false`) the specified application commands. Defaults to
	 * `true`
	 * @see {@link ApplicationCommandType} | {@link Client}
	 */
	function updateApplicationCommands(
		client?: Client<true>,
		applicationCommands?: Partial<Record<keyof typeof ApplicationCommandType, string[]>>,
		include?: boolean,
	): Promise<void>;
}

global.updateApplicationCommands = async function (
	client?,
	x: boolean | Partial<Record<keyof typeof ApplicationCommandType, string[]>> = false,
	include: boolean = true,
): Promise<void> {
	/** Force reload overload parameter */
	const forceReload = typeof x === "boolean" ? x : false;

	/** Application commands overload parameter */
	const commands =
		typeof x === "boolean" ||
		(Object.keys(x).length ===
			Object.keys(ApplicationCommandType).filter((key) => typeof key === "string").length &&
			Object.values(x).every((applicationCommandType) => applicationCommandType.length === 0))
			? undefined
			: x;

	notify(
		"INFO",
		`Updating application command${Object.values(commands ?? {}).flat().length === 1 ? "" : "s"}${
			Object.values(commands ?? {}).flat().length === 1
				? ` ${Object.values(commands ?? {})
						.flat()
						.map((applicationCommand) => `'${applicationCommand}'`)
						.join(", ")}`
				: ""
		}... `,
	);

	/** List of chat input command files */
	const chatInputCommandFiles = await readFiles<SavedChatInputCommand>(configuration.paths.chatInputCommandsPath);

	/** List of message command files */
	const messageCommandFiles = await readFiles<SavedMessageCommand>(configuration.paths.messageCommandsPath);

	/** List of user command files */
	const userCommandFiles = await readFiles<SavedUserCommand>(configuration.paths.userCommandsPath);

	if (commands) {
		Object.entries(commands).forEach(([applicationCommandType, applicationCommands]) => {
			commands[applicationCommandType as keyof typeof commands] = applicationCommands.filter(
				(applicationCommand) => {
					/** Whether this application command is known and can be updated */
					var known =
						savedApplicationCommands[applicationCommandType as keyof typeof commands]?.some(
							(savedApplicationCommand) => savedApplicationCommand.data.name === applicationCommand,
						) ?? false;

					switch (applicationCommandType) {
						case ApplicationCommandType[ApplicationCommandType.ChatInput]:
							known =
								known &&
								chatInputCommandFiles.some(
									(chatInputCommandFile) => chatInputCommandFile.data.name === applicationCommand,
								);

							break;
						case ApplicationCommandType[ApplicationCommandType.Message]:
							known =
								known &&
								messageCommandFiles.some(
									(messageCommandFile) => messageCommandFile.data.name === applicationCommand,
								);

							break;
						case ApplicationCommandType[ApplicationCommandType.User]:
							known =
								known &&
								userCommandFiles.some(
									(userCommandFile) => userCommandFile.data.name === applicationCommand,
								);

							break;

						default:
							known = false;
					}

					if (!known) {
						notify("WARNING", `Application command '${applicationCommand}' does not exist`);
					}

					return known;
				},
			);
		});
	}

	Object.keys(savedApplicationCommands).forEach((applicationCommmandType) => {
		savedApplicationCommands[applicationCommmandType as keyof typeof ApplicationCommandType]?.sweep(
			(_, applicationCommandName) => {
				switch (applicationCommmandType) {
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
			},
		);
	});

	for (const applicationCommandFiles of [chatInputCommandFiles, messageCommandFiles, userCommandFiles]) {
		applicationCommandFiles.forEach((applicationCommandFile) => {
			if (
				forceReload ||
				(commands &&
					(commands[ApplicationCommandType[applicationCommandFile.type] as keyof typeof commands]?.includes(
						`${applicationCommandFile.data.name}`,
					) ??
						false)) === include ||
				!savedApplicationCommands[
					ApplicationCommandType[applicationCommandFile.type] as keyof typeof savedApplicationCommands
				]?.has(applicationCommandFile.data.name)
			) {
				savedApplicationCommands[
					ApplicationCommandType[applicationCommandFile.type] as keyof typeof savedApplicationCommands
				]?.set(applicationCommandFile.data.name, applicationCommandFile);
			}
		});
	}

	if (client) {
		/** Registered application commands */
		const registeredApplicationCommands = await client.application.commands.fetch();

		/** Default values of a saved application command */
		const defaultValues = {
			contexts: null,
			default_member_permissions: null,
			integration_types: client.application.integrationTypesConfig
				? Object.keys(client.application.integrationTypesConfig).map((key) => parseInt(key))
				: [],
			nsfw: false,
		};

		/** Promises to send to Discord API */
		const tasks: { add: Task<void>[]; remove: Task<void>[]; update: Task<void>[] } = {
			add: [],
			remove: [],
			update: [],
		};

		Object.values(savedApplicationCommands).forEach((applicationCommandCollection) => {
			applicationCommandCollection
				.filter(
					(applicationCommand) =>
						commands &&
						(commands[ApplicationCommandType[applicationCommand.type] as keyof typeof commands]?.includes(
							`${applicationCommand.data.name as keyof typeof commands}`,
						) ?? false) === include,
				)
				.forEach((savedApplicationCommand, savedApplicationCommandName) => {
					/** Registered application command matching the saved application command */
					const registeredApplicationCommand = registeredApplicationCommands.find(
						(registeredApplicationCommand) =>
							registeredApplicationCommand.name === savedApplicationCommandName,
					);

					/** Data of the saved application command with added default values */
					const savedApplicationCommandData = Object.fromEntries([
						...Object.entries(savedApplicationCommand.data).map(([key, value]) => {
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
						tasks.add.push(async () =>
							client.application.commands
								.create(savedApplicationCommand.data as ApplicationCommandData)
								.then((createdApplicationCommand) => {
									notify(
										"SUCCESS",
										`Added new application command '${savedApplicationCommandName}'`,
										client,
										`I learned a new trick! You can now use the application command ${
											savedApplicationCommand.type === ApplicationCommandType.ChatInput
												? commandMention(
														createdApplicationCommand.name,
														createdApplicationCommand.id,
												  )
												: `'${bold(savedApplicationCommandName)}'`
										}!`,
										2,
									);
								})
								.catch((error: Error) => {
									notify(
										"ERROR",
										`Failed to reload application command '${savedApplicationCommandName}':\n${error}`,
										client,
										`I tried to learn a new trick, but failed! The application command ${bold(
											savedApplicationCommandName,
										)} could not be added:\n${code(error.message)}!`,
										3,
									);
								}),
						);
					} else if (forceReload || !registeredApplicationCommand.equals(savedApplicationCommandData)) {
						tasks.update.push(async () =>
							registeredApplicationCommand
								.edit(savedApplicationCommand.data as ApplicationCommandData)
								.then((updatedApplicationCommand) => {
									notify(
										"SUCCESS",
										`Updated application command '${savedApplicationCommandName}'`,
										client,
										`I've spent some time training my tricks! The application command ${
											savedApplicationCommand.type === ApplicationCommandType.ChatInput
												? commandMention(
														updatedApplicationCommand.name,
														updatedApplicationCommand.id,
												  )
												: `'${bold(savedApplicationCommandName)}'`
										} just got an update!`,
										2,
									);
								})
								.catch((error: Error) => {
									notify(
										"ERROR",
										`Failed to update application command '${savedApplicationCommandName}':\n${error}`,
										client,
										`I tried to update a trick, but failed! The application command ${
											savedApplicationCommand.type === ApplicationCommandType.ChatInput
												? commandMention(
														savedApplicationCommand.data.name,
														savedApplicationCommand.data.id,
												  )
												: `'${bold(savedApplicationCommandName)}'`
										} could not be reloaded:\n${code(error.message)}!`,
										3,
									);
								}),
						);
					}
				});
		});

		registeredApplicationCommands.forEach((registeredApplicationCommand) => {
			if (
				!savedApplicationCommands[
					ApplicationCommandType[registeredApplicationCommand.type] as keyof typeof ApplicationCommandType
				]?.has(registeredApplicationCommand.name)
			) {
				tasks.remove.push(async () =>
					registeredApplicationCommand
						.delete()
						.then(() => {
							notify(
								"SUCCESS",
								`Removed deprecated application command '${registeredApplicationCommand.name}'`,
								client,
								`I forgot a trick! The application command ${bold(
									registeredApplicationCommand.name,
								)} is no longer available.`,
								2,
							);
						})
						.catch((error: Error) => {
							notify(
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

		await Promise.all(
			Object.values(tasks)
				.flat()
				.map((task) => task()),
		)
			.then(() =>
				notify(
					"SUCCESS",
					`Added ${tasks.add.length}, deleted ${tasks.remove.length} and updated ${tasks.update.length} ` +
						`application commands`,
					client,
					`My update was completed! I've added ${bold(tasks.add.length)}, deleted ${bold(
						tasks.remove.length,
					)} and updated ${bold(tasks.update.length)} application command!`,
					1,
				),
			)
			.catch((error: Error) => {
				notify(
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
