// Global imports
import "../../../globals/applicationCommandUpdate";
import "../../../globals/applicationCommandTypeUpdate";
import "../../../globals/discordTextFormat";
import "../../../globals/eventTypeUpdate";
import "../../../globals/fileUpdate";
import "../../../globals/interactionTypeUpdate";
import {
	applicationCommands,
	applicationCommandTypes,
	configuration,
	interactionTypes,
} from "../../../globals/variables";

// Type imports
import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	ClientEvents,
	InteractionType,
	SlashCommandBuilder,
} from "discord.js";
import { SavedApplicationCommand, SavedChatInputCommand } from "../../../types/applicationCommands";
import { FileInclude } from "../../../types/others";

/** Chat input command to update files of the bot */
const chatInputCommand: SavedChatInputCommand = {
	owner: true,

	data: new SlashCommandBuilder()
		.addSubcommand((subcommand) =>
			subcommand.setDescription("Updates the blocked users of the bot").setName("blocked_users"),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.addBooleanOption((option) =>
					option
						.setDescription("Whether all application command types should be updated regardless of changes")
						.setName("force_reload"),
				)
				.addStringOption((option) =>
					option
						.setAutocomplete(true)
						.setDescription("Name of the application command type that should be updated")
						.setName("command_type"),
				)
				.setDescription("Updates the application command types of the bot")
				.setName("command_types"),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.addBooleanOption((option) =>
					option
						.setDescription("Whether all application commands should be updated regardless of changes")
						.setName("force_reload"),
				)
				.addStringOption((option) =>
					option
						.setAutocomplete(true)
						.setDescription("Name of the application command that should be updated")
						.setName("command_name"),
				)
				.setDescription("Updates the application commands of the bot")
				.setName("commands"),
		)
		.addSubcommand((subcommand) =>
			subcommand.setDescription("Updates the configuration of the bot").setName("configuration"),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.addBooleanOption((option) =>
					option
						.setName("force_reload")
						.setDescription("Whether all event types should be updated regardless of changes"),
				)
				.addStringOption((option) =>
					option
						.setName("event_type")
						.setDescription("Name of the event type that should be updated")
						.setAutocomplete(true),
				)

				.setDescription("Updates the event listeners of the bot")
				.setName("event_types"),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.addBooleanOption((option) =>
					option
						.setDescription("Whether all interaction types should be updated regardless of changes")
						.setName("force_reload"),
				)
				.addStringOption((option) =>
					option
						.setAutocomplete(true)
						.setDescription("Name of the interaction type that should be updated")
						.setName("interaction_type"),
				)
				.setDescription("Updates the interaction types of the bot")
				.setName("interaction_types"),
		)
		.setDescription("Updates a specific type of files of the bot")
		.setIntegrationTypes(ApplicationIntegrationType.UserInstall)
		.setName("update"),

	type: ApplicationCommandType.ChatInput,

	async autocomplete(interaction) {
		/** Value that was entered at the time */
		const option = interaction.options.getFocused().toUpperCase();

		/** Results to be shown as autocomplete suggestions */
		const results: { name: string; value: string }[] = [];

		switch (interaction.options.getSubcommand().toUpperCase()) {
			case "COMMANDS":
				/** Application commands with names including the typed value */
				const foundApplicationCommands: SavedApplicationCommand[] = [];

				// Find application commands with names including the typed value
				Object.values(applicationCommands).forEach((applicationCommands) => {
					foundApplicationCommands.push(
						...[...applicationCommands.values()].filter((applicationCommand) =>
							applicationCommand.data.name.toUpperCase().includes(option),
						),
					);
				});

				results.push(
					...foundApplicationCommands
						.map((applicationCommand) => ({
							name: `${applicationCommand.data.name} (${
								ApplicationCommandType[applicationCommand.type]
							})`,
							value: `${applicationCommand.data.name}:${applicationCommand.type}`,
						}))
						.sort((a, b) => (a.name < b.name ? -1 : 1)),
				);

				break;

			case "COMMAND_TYPES":
				results.push(
					...applicationCommandTypes
						.filter((_, applicationCommandType) => applicationCommandType.toUpperCase().includes(option))
						.map((_, applicationCommandType) => ({
							name: applicationCommandType,
							value: applicationCommandType,
						}))
						.sort((a, b) => (a.name < b.name ? -1 : 1)),
				);

				break;

			case "EVENT_TYPES":
				results.push(
					...(interaction.client.eventNames() as (keyof ClientEvents)[])
						.filter((eventType) => eventType.toUpperCase().includes(option))
						.map((eventType) => ({
							name: eventType,
							value: eventType,
						}))
						.sort((a, b) => (a.name < b.name ? -1 : 1)),
				);

				break;

			case "INTERACTION_TYPES":
				results.push(
					...interactionTypes
						.filter((_, interactionType) => interactionType.toUpperCase().includes(option))
						.map((_, interactionType) => ({
							name: interactionType,
							value: interactionType,
						}))
						.sort((a, b) => (a.name < b.name ? -1 : 1)),
				);

				break;
		}

		interaction.respond(results.splice(0, configuration.discord.maximalAutocompleteResults));
	},

	async execute(interaction) {
		/** The value of the force reload option */
		const forceReload = interaction.options.getBoolean("force_reload") ?? false;

		/** Files that should be updated */
		const include: FileInclude = {};

		// Respond based on subcommand
		switch (interaction.options.getSubcommand().toUpperCase()) {
			case "BLOCKED_USERS":
				await interaction.reply("Updating blocked users... ");

				include.blockedUsers = true;

				break;
			case "COMMANDS":
				/** Name and type of the application command to update */
				const [commandName, type] = interaction.options.getString("command_name")?.split(":") ?? [
					undefined,
					undefined,
				];

				await interaction.reply(
					`Updating application command${
						commandName && type
							? ` ${commandMention(
									commandName,
									(
										await interaction.client.application.commands.fetch()
									).find(
										(applicationCommand) =>
											applicationCommand.name === commandName &&
											applicationCommand.type === parseInt(type),
									)!.id,
							  )}`
							: "s"
					}... `,
				);

				include.applicationCommands =
					commandName && type
						? { [ApplicationCommandType[Number(type) as ApplicationCommandType]]: [commandName] }
						: forceReload;

				break;
			case "COMMAND_TYPES":
				/** The application command type to update */
				const commandType = interaction.options.getString("command_type") ?? undefined;

				include.applicationCommandTypes = commandType
					? [commandType as keyof typeof ApplicationCommandType]
					: forceReload;

				await interaction.reply(
					`Updating application command type${
						Array.isArray(include.applicationCommandTypes)
							? ` ${include.applicationCommandTypes
									.map((applicationCommandType) =>
										bold(ApplicationCommandType[applicationCommandType]),
									)
									.join(", ")}`
							: "s"
					}...`,
				);

				break;

			case "CONFIGURATION":
				await interaction.reply("Updating configuration... ");

				include.configuration = true;

				break;

			case "EVENT_TYPES":
				/** The event type to update */
				const eventType = interaction.options.getString("event_type") ?? undefined;

				await interaction.reply({
					content: `Updating application command type${
						Array.isArray(include.eventTypes)
							? ` ${include.eventTypes.map((eventType) => bold(eventType)).join(", ")}`
							: "s"
					}...`,
					ephemeral: true,
				});

				include.eventTypes = eventType ? [eventType as keyof ClientEvents] : forceReload;

				break;

			case "INTERACTION_TYPES":
				/** The interaction type to update */
				const interactionType = interaction.options.getString("interaction_type") ?? undefined;

				await interaction.reply({
					content: `Updating application command type${
						Array.isArray(include.interactionTypes)
							? ` ${include.interactionTypes
									.map((interactionType) => bold(InteractionType[interactionType]))
									.join(", ")}`
							: "s"
					}...`,
					ephemeral: true,
				});

				include.interactionTypes = interactionType
					? [interactionType as keyof typeof InteractionType]
					: forceReload;

				break;

			default:
				interaction.reply({
					content: `The subcommand ${commandMention(interaction)} is not implemented by now.`,
					ephemeral: true,
				});

				return;
		}

		await updateFiles(interaction.client, include);

		interaction.editReply("Update finished");
	},
};

export default chatInputCommand;
