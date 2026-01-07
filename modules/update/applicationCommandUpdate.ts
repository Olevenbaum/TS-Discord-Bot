// Class & type imports
import type { SavedChatInputCommand, SavedMessageCommand, SavedUserCommand, Task } from "../../types";

// Data import
import { client } from "#application";
import { applicationCommands as savedApplicationCommands, configuration } from "#variables";

// External libraries imports
import {
	ApplicationCommandData,
	ApplicationCommandType,
	bold,
	chatInputApplicationCommandMention,
	codeBlock,
} from "discord.js";

// Module imports
import readFiles from "../fileReader";
import notify from "../notification";

/**
 * Iterates all files in the application command directoryies. If files were deleted, the matching application commands
 * are removed from the collection. If files were added the matching application commands are added to the collection.
 * On force reload remaining application commands are reloaded from the matching files.
 * @param forceReload - Whether to reload all existing application commands (defaults to `false`)
 */
export default async function updateApplicationCommands(forceReload?: boolean): Promise<void>;

/**
 * Iterates all files in the application command directories. If files were deleted, the matching application commands
 * are removed from the collection. If files were added the matching application commands are added to the collection.
 * Any specified application commands either reloaded or are excluded from reloading.
 * @param applicationCommands - Application commands to reload or exclude from reloading
 * @param exclude - Whether to include (`false`) or exclude (`true`) the specified application commands (defaults to
 * `false`)
 * @see {@link ApplicationCommandType}
 */
export default async function updateApplicationCommands(
	applicationCommands:
		| Partial<Record<ApplicationCommandType, string[]>>
		| Partial<Record<keyof typeof ApplicationCommandType, string[]>>,
	exclude?: boolean,
): Promise<void>;

export default async function updateApplicationCommands(
	x:
		| boolean
		| Partial<Record<ApplicationCommandType, string[]>>
		| Partial<Record<keyof typeof ApplicationCommandType, string[]>> = false,
	exclude: boolean = false,
) {
	/** Application commands overload parameter */
	const commands: Partial<Record<ApplicationCommandType, string[]>> | undefined =
		typeof x === "boolean"
			? undefined
			: Object.keys(x).every((applicationCommandType) => typeof applicationCommandType === "string")
			? Object.fromEntries(
					Object.entries(x as Partial<Record<keyof typeof ApplicationCommandType, string[]>>).map(
						([applicationCommandType, applicationCommandColletion]) => [
							ApplicationCommandType[applicationCommandType as keyof typeof ApplicationCommandType],
							applicationCommandColletion,
						],
					),
			  )
			: (x as Partial<Record<ApplicationCommandType, string[]>>);

	/** Force reload overload parameter */
	const forceReload = typeof x === "boolean" ? x : false;

	notify(
		`Updating application command${Object.values(commands ?? {}).flat().length === 1 ? "" : "s"}${
			Object.values(commands ?? {}).flat().length === 1
				? ` ${Object.values(commands ?? {})
						.flat()
						.map((applicationCommand) => `'${applicationCommand}'`)
						.join(", ")}`
				: ""
		}... `,
		"INFORMATION",
	);

	/** List of chat input command files */
	const chatInputCommandFiles = await readFiles<SavedChatInputCommand>(configuration.paths.chatInputCommandsPath);

	/** List of message command files */
	const messageCommandFiles = await readFiles<SavedMessageCommand>(configuration.paths.messageCommandsPath);

	/** List of user command files */
	const userCommandFiles = await readFiles<SavedUserCommand>(configuration.paths.userCommandsPath);

	if (commands) {
		Object.entries(commands).forEach(([applicationCommandType, applicationCommands]) => {
			commands[applicationCommandType] = applicationCommands.filter((applicationCommand) => {
				if (
					!savedApplicationCommands[applicationCommandType]?.some(
						(savedApplicationCommand) => savedApplicationCommand.data.name === applicationCommand,
					)
				) {
					notify(`No application commands of type '${applicationCommandType}' exist`, "WARNING");

					return false;
				}

				switch (applicationCommandType) {
					case ApplicationCommandType[ApplicationCommandType.ChatInput]:
						return chatInputCommandFiles.some(
							(chatInputCommandFile) => chatInputCommandFile.data.name === applicationCommand,
						);

					case ApplicationCommandType[ApplicationCommandType.Message]:
						return messageCommandFiles.some(
							(messageCommandFile) => messageCommandFile.data.name === applicationCommand,
						);

					case ApplicationCommandType[ApplicationCommandType.User]:
						return userCommandFiles.some(
							(userCommandFile) => userCommandFile.data.name === applicationCommand,
						);

					default:
						return false;
				}
			});
		});
	}

	Object.keys(savedApplicationCommands).forEach((applicationCommmandType) => {
		savedApplicationCommands[applicationCommmandType]!.sweep((_, applicationCommandName) => {
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
		});
	});

	for (const applicationCommandFiles of [chatInputCommandFiles, messageCommandFiles, userCommandFiles]) {
		applicationCommandFiles.forEach((applicationCommandFile) => {
			if (
				forceReload ||
				(commands &&
					(commands[applicationCommandFile.type]!.includes(`${applicationCommandFile.data.name}`) ??
						false)) !== exclude ||
				!savedApplicationCommands[applicationCommandFile.type]!.has(applicationCommandFile.data.name)
			) {
				savedApplicationCommands[applicationCommandFile.type]!.set(
					applicationCommandFile.data.name,
					applicationCommandFile,
				);
			}
		});
	}

	if (client.isReady()) {
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
						(commands[applicationCommand.type]!.includes(`${applicationCommand.data.name}`) ?? false) !==
							exclude,
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
										`Added new application command '${savedApplicationCommandName}'`,
										"SUCCESS",
										`I learned a new trick! You can now use the application command ${
											savedApplicationCommand.type === ApplicationCommandType.ChatInput
												? chatInputApplicationCommandMention(
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
										`Failed to reload application command '${savedApplicationCommandName}':`,
										error,
										`I tried to learn a new trick, but failed! The application command ${bold(
											savedApplicationCommandName,
										)} could not be added:\n${codeBlock(error.message)}!`,
										4,
									);
								}),
						);
					} else if (forceReload || !registeredApplicationCommand.equals(savedApplicationCommandData)) {
						tasks.update.push(async () =>
							registeredApplicationCommand
								.edit(savedApplicationCommand.data as ApplicationCommandData)
								.then((updatedApplicationCommand) => {
									notify(
										`Updated application command '${savedApplicationCommandName}'`,
										"SUCCESS",
										`I've spent some time training my tricks! The application command ${
											savedApplicationCommand.type === ApplicationCommandType.ChatInput
												? chatInputApplicationCommandMention(
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
										`Failed to update application command '${savedApplicationCommandName}':`,
										error,
										`I tried to update a trick, but failed! The application command '${bold(
											savedApplicationCommandName,
										)}' could not be reloaded:\n${codeBlock(error.message)}!`,
										4,
									);
								}),
						);
					}
				});
		});

		registeredApplicationCommands.forEach((registeredApplicationCommand) => {
			if (!savedApplicationCommands[registeredApplicationCommand.type]?.has(registeredApplicationCommand.name)) {
				tasks.remove.push(async () =>
					registeredApplicationCommand
						.delete()
						.then(() => {
							notify(
								`Removed deprecated application command '${registeredApplicationCommand.name}'`,
								"SUCCESS",
								`I forgot a trick! The application command ${bold(
									registeredApplicationCommand.name,
								)} is no longer available.`,
								2,
							);
						})
						.catch((error: Error) => {
							notify(
								`Failed to remove deprecated application command '${registeredApplicationCommand.name}':`,
								error,
								`I tried to forget a trick, but failed! The application command ${bold(
									registeredApplicationCommand.name,
								)} could not be removed:\n${codeBlock(error.message)}!`,
								4,
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
					`Added ${tasks.add.length}, deleted ${tasks.remove.length} and updated ${tasks.update.length} application commands`,
					"SUCCESS",
					`My update was completed! I've added ${bold(tasks.add.length.toString())}, deleted ${bold(
						tasks.remove.length.toString(),
					)} and updated ${bold(tasks.update.length.toString())} application commands!`,
					2,
				),
			)
			.catch((error: Error) => {
				notify(
					`Failed to update application commands:`,
					error,
					`I tried to update my tricks, but failed! None of the application commands could be reloaded:\n${codeBlock(
						error.message,
					)}!`,
					4,
				);
			});
	}
}
