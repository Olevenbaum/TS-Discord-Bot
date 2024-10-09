// Global imports
import "../../../globals/applicationCommandUpdate";
import "../../../globals/applicationCommandTypeUpdate";
import "../../../globals/discordTextFormat";
import "../../../globals/eventTypeUpdate";
import "../../../globals/fileUpdate";
import "../../../globals/interactionTypeUpdate";
import { applicationCommands, applicationCommandTypes, interactionTypes } from "../../../globals/variables";

// Type imports
import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    ClientEvents,
    InteractionType,
    SlashCommandBuilder,
} from "discord.js";
import { SavedApplicationCommand, SavedChatInputCommand } from "../../../types/applicationCommands";
import { Configuration } from "../../../types/configuration";
import { FileInclude } from "../../../types/others";

/**
 * Chat input command to update files of the bot
 */
const chatInputCommand: SavedChatInputCommand = {
    owner: true,

    data: new SlashCommandBuilder()
        .addSubcommand((subcommand) =>
            subcommand.setDescription("Updates the blocked users of the bot").setName("blocked_users")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .addBooleanOption((option) =>
                    option
                        .setDescription("Whether all application command types should be updated regardless of changes")
                        .setName("force_reload")
                )
                .addStringOption((option) =>
                    option
                        .setAutocomplete(true)
                        .setDescription("Name of the application command type that should be updated")
                        .setName("command_type")
                )
                .setDescription("Updates the application command types of the bot")
                .setName("command_types")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .addBooleanOption((option) =>
                    option
                        .setDescription("Whether all application commands should be updated regardless of changes")
                        .setName("force_reload")
                )
                .addStringOption((option) =>
                    option
                        .setAutocomplete(true)
                        .setDescription("Name of the application command that should be updated")
                        .setName("command_name")
                )
                .setDescription("Updates the application commands of the bot")
                .setName("commands")
        )
        .addSubcommand((subcommand) =>
            subcommand.setDescription("Updates the configuration of the bot").setName("configuration")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .addBooleanOption((option) =>
                    option
                        .setName("force_reload")
                        .setDescription("Whether all event types should be updated regardless of changes")
                )
                .addStringOption((option) =>
                    option
                        .setName("event_type")
                        .setDescription("Name of the event type that should be updated")
                        .setAutocomplete(true)
                )

                .setDescription("Updates the event listeners of the bot")
                .setName("event_types")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .addBooleanOption((option) =>
                    option
                        .setDescription("Whether all interaction types should be updated regardless of changes")
                        .setName("force_reload")
                )
                .addStringOption((option) =>
                    option
                        .setAutocomplete(true)
                        .setDescription("Name of the interaction type that should be updated")
                        .setName("interaction_type")
                )
                .setDescription("Updates the interaction types of the bot")
                .setName("interaction_types")
        )
        .setDescription("Updates a specific type of files of the bot")
        .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
        .setName("update"),

    type: ApplicationCommandType.ChatInput,

    async autocomplete(_: Configuration, interaction: AutocompleteInteraction) {
        /**
         * Value that was already typed
         */
        const option = interaction.options.getFocused().toUpperCase();

        // Check subcommand
        switch (interaction.options.getSubcommand().toUpperCase()) {
            case "COMMANDS":
                /**
                 * Application commands with names including the typed value
                 */
                const foundApplicationCommands: SavedApplicationCommand[] = [];

                // Add application commands with names including the typed value
                Object.values(applicationCommands).forEach((applicationCommands) => {
                    foundApplicationCommands.push(
                        ...[...applicationCommands.values()].filter((applicationCommand) =>
                            applicationCommand.data.name.toUpperCase().includes(option)
                        )
                    );
                });

                // Respond with application command names
                interaction.respond(
                    foundApplicationCommands
                        .map((applicationCommand) => ({
                            name: `${applicationCommand.data.name} (${
                                ApplicationCommandType[applicationCommand.type]
                            })`,
                            value: `${applicationCommand.data.name}:${applicationCommand.type}`,
                        }))
                        .sort((a, b) => (a.name < b.name ? -1 : 1))
                        .slice(0, 25)
                );

                // Break switch
                break;

            case "COMMAND_TYPES":
                // Respond with application command types
                interaction.respond(
                    applicationCommandTypes
                        .filter((_, applicationCommandType) =>
                            ApplicationCommandType[applicationCommandType].toUpperCase().includes(option)
                        )
                        .map((_, applicationCommandType) => ({
                            name: ApplicationCommandType[applicationCommandType],
                            value: String(applicationCommandType),
                        }))
                        .sort((a, b) => (a.name < b.name ? -1 : 1))
                        .slice(0, 25)
                );

                // Break switch
                break;

            case "EVENT_TYPES":
                // Respond with event types
                interaction.respond(
                    (interaction.client.eventNames() as (keyof ClientEvents)[])
                        .filter((eventType) => eventType.toUpperCase().includes(option))
                        .map((eventType) => ({
                            name: eventType,
                            value: eventType,
                        }))
                        .sort((a, b) => (a.name < b.name ? -1 : 1))
                        .slice(0, 25)
                );

                // Break switch
                break;

            case "INTERACTION_TYPES":
                // Respond with interaction types
                interaction.respond(
                    interactionTypes
                        .filter((_, interactionType) => InteractionType[interactionType].toUpperCase().includes(option))
                        .map((_, interactionType) => ({
                            name: InteractionType[interactionType],
                            value: String(interactionType),
                        }))
                        .sort((a, b) => (a.name < b.name ? -1 : 1))
                        .slice(0, 25)
                );

                // Break switch
                break;

            default:
                // Repond with empty array
                interaction.respond([]);
        }
    },

    async execute(configuration: Configuration, interaction: ChatInputCommandInteraction) {
        /**
         * The value of the force reload option
         */
        const forceReload = interaction.options.getBoolean("force_reload") ?? false;

        /**
         * Files that should be updated
         */
        const include: FileInclude = {};

        // Check the subcommand
        switch (interaction.options.getSubcommand().toUpperCase()) {
            case "BLOCKED_USERS":
                // Interaction response
                await interaction.reply("Updating blocked users... ");

                // Include blocked users
                include.blockedUsers = true;

                // Break switch
                break;
            case "COMMANDS":
                /**
                 * Name and tpye of the application command to update
                 */
                const [commandName, type] = interaction.options.getString("command_name")?.split(":") ?? [
                    undefined,
                    undefined,
                ];

                // Interaction response
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
                                          applicationCommand.type === parseInt(type)
                                  )!.id
                              )}`
                            : "s"
                    }... `
                );

                // Include application commands
                include.applicationCommands =
                    commandName && type ? [`${commandName}:${parseInt(type) as ApplicationCommandType}`] : forceReload;

                // Break switch
                break;
            case "COMMAND_TYPES":
                /**
                 * The application command type to update
                 */
                const commandType = interaction.options.getString("command_type") ?? undefined;

                // Include application command types
                include.applicationCommandTypes = commandType ? [parseInt(commandType)] : forceReload;

                // Interaction response
                await interaction.reply(
                    `Updating application command type${
                        Array.isArray(include.applicationCommandTypes)
                            ? ` ${include.applicationCommandTypes
                                  .map((applicationCommandType) => bold(ApplicationCommandType[applicationCommandType]))
                                  .join(", ")}`
                            : "s"
                    }...`
                );

                // Break switch
                break;

            case "CONFIGURATION":
                // Interaction response
                await interaction.reply("Updating configuration... ");

                // Include configuration
                include.configuration = true;

                // Break switch
                break;

            case "EVENT_TYPES":
                /**
                 * The event type to update
                 */
                const eventType = interaction.options.getString("event_type") ?? undefined;

                // Interaction response
                await interaction.reply(
                    `Updating application command type${
                        Array.isArray(include.eventTypes)
                            ? ` ${include.eventTypes.map((eventType) => bold(eventType)).join(", ")}`
                            : "s"
                    }...`
                );

                // Include event types
                include.eventTypes = eventType ? [eventType as keyof ClientEvents] : forceReload;

                // Break switch
                break;

            case "INTERACTION_TYPES":
                /**
                 * The interaction type to update
                 */
                const interactionType = interaction.options.getString("interaction_type") ?? undefined;

                // Interaction response
                await interaction.reply(
                    `Updating application command type${
                        Array.isArray(include.interactionTypes)
                            ? ` ${include.interactionTypes
                                  .map((interactionType) => bold(InteractionType[interactionType]))
                                  .join(", ")}`
                            : "s"
                    }...`
                );

                // Include interaction types
                include.interactionTypes = interactionType ? [parseInt(interactionType)] : forceReload;

                // Break switch
                break;

            default:
                // Interaction response
                interaction.reply(`The subcommand ${commandMention(interaction)} is not implemented by now.`);

                // Exit function
                return;
        }

        // Update files
        await updateFiles(configuration, interaction.client, include);

        // Edit interaction response
        interaction.editReply("Update finished");
    },
};

export default chatInputCommand;
