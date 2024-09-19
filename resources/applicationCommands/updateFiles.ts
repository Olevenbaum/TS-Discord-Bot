// Global imports
import "../../globals/applicationCommandUpdate";
import "../../globals/applicationCommandTypeUpdate";
import "../../globals/blockedUsersUpdate";
import "../../globals/discordTextFormat";
import "../../globals/interactionTypeUpdate";
import { applicationCommands, applicationCommandTypes, interactionTypes } from "../../globals/variables";

// Type imports
import {
    ApplicationCommand,
    ApplicationCommandType,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    InteractionType,
    Routes,
    SlashCommandBuilder,
} from "discord.js";
import { SavedChatInputCommand } from "../../types/applicationCommands";
import { Configuration } from "../../types/configuration";

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
                        .setDescription("Whether all interaction types should be updated regardless of changes")
                        .setName("force_reload")
                )
                .addStringOption((option) =>
                    option
                        .setAutocomplete(true)
                        .setDescription("Name of the interaction types that should be updated")
                        .setName("interaction_type")
                )
                .setDescription("Updates the interaction types of the bot")
                .setName("interaction_types")
        )
        .setDescription("Updates a specific type of files of the bot")
        .setName("update"),
    type: ApplicationCommandType.ChatInput,

    async autocomplete(_: Configuration, interaction: AutocompleteInteraction) {
        /**
         * The value that was already typed
         */
        const option = interaction.options.getFocused().toUpperCase();

        // Check the subcommand
        switch (interaction.options.getSubcommand()) {
            case "commands":
                // Respond with application command names
                interaction.respond(
                    applicationCommands
                        .filter((_, applicationCommandName) => applicationCommandName.toUpperCase().includes(option))
                        .map((_, applicationCommandName) => ({
                            name: applicationCommandName,
                            value: applicationCommandName,
                        }))
                        .slice(0, 25)
                );

                // Break switch
                break;

            case "command_types":
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
                        .slice(0, 25)
                );

                // Break switch
                break;

            case "interaction_types":
                // Respond with interaction types
                interaction.respond(
                    interactionTypes
                        .filter((_, interactionType) => InteractionType[interactionType].toUpperCase().includes(option))
                        .map((_, interactionType) => ({
                            name: InteractionType[interactionType],
                            value: String(interactionType),
                        }))
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
        const forceReload = interaction.options.getBoolean("force_reload") ?? undefined;

        // Check the subcommand
        switch (interaction.options.getSubcommand()) {
            case "blocked_users":
                // Interaction response
                interaction.reply("Updating blocked users...");

                // Update blocked users
                updateBlockedUsers(configuration);

                // Break switch
                break;
            case "commands":
                /**
                 * The name of the application command to update
                 */
                const commandName = interaction.options.getString("command_name");

                // Check if a command name was provided
                if (commandName) {
                    /**
                     * Application command that was updated
                     */
                    const applicationCommand = (
                        (await interaction.client.rest.get(
                            Routes.applicationCommands(interaction.client.application.id)
                        )) as ApplicationCommand[]
                    ).find((applicationCommand) => applicationCommand.name === commandName);

                    // Check if application command was found
                    if (applicationCommand) {
                        // Interaction response
                        await interaction.reply(
                            `Updating application command ${commandMention(
                                applicationCommand.name,
                                applicationCommand.id
                            )}... `
                        );
                    }

                    // Update application command
                    updateApplicationCommands(configuration, interaction.client, [commandName]).then(() => {
                        // Check if application command was found
                        if (applicationCommand) {
                            // Interaction follow up message
                            interaction.followUp(
                                `Finished updating application command ${commandMention(
                                    applicationCommand.name,
                                    applicationCommand.id
                                )}`
                            );
                        }
                    });
                } else {
                    // Interaction response
                    await interaction.reply("Updating application commands... ");

                    // Update application commands
                    updateApplicationCommands(configuration, interaction.client, forceReload).then(() =>
                        // Interaction follow up message
                        interaction.followUp("Finished updating application commands")
                    );
                }

                // Break switch
                break;

            case "command_types":
                /**
                 * The name of the application command type to update
                 */
                const commandType = interaction.options.getString("command_type");

                // Check if a command type was provided
                if (commandType) {
                    // Interaction response
                    await interaction.reply(
                        `Updating application command type ${bold(
                            ApplicationCommandType[parseInt(commandType)] ?? ""
                        )}...`
                    );

                    // Update application command types
                    updateApplicationCommandTypes(configuration, [parseInt(commandType)]).then(() =>
                        // Interaction follow up message
                        interaction.followUp(
                            `Finished updating application command type ${bold(
                                ApplicationCommandType[parseInt(commandType)] ?? ""
                            )}`
                        )
                    );
                } else {
                    // Interaction response
                    await interaction.reply("Updating application command types...");

                    // Update application command types
                    updateApplicationCommandTypes(configuration, forceReload).then(() =>
                        // Interaction follow up message
                        interaction.followUp("Finished updating application command types")
                    );
                }

                // Break switch
                break;

            case "interaction_types":
                /**
                 * The name of the application command to update
                 */
                const interactionType = interaction.options.getString("command_name");

                // Check if a command name was provided
                if (interactionType) {
                    // Interaction response
                    await interaction.reply(
                        `Updating interaction type ${bold(InteractionType[parseInt(interactionType)] ?? "")}...`
                    );

                    // Update application commands
                    updateInteractionTypes(configuration, [parseInt(interactionType)]).then(() =>
                        // Interaction follow up message
                        interaction.followUp(
                            `Finished updating interaction type ${bold(
                                InteractionType[parseInt(interactionType)] ?? ""
                            )}`
                        )
                    );
                } else {
                    // Interaction response
                    await interaction.reply("Updating interaction types...");

                    // Update application commands
                    updateInteractionTypes(configuration, forceReload).then(() =>
                        // Interaction follow up message
                        interaction.followUp("Finished updating interaction types")
                    );
                }

                // Break switch
                break;

            default:
                // Interaction response
                interaction.reply({
                    content: `The subcommand ${commandMention(interaction)} is not implemented by now`,
                    ephemeral: true,
                });
        }
    },
};

export default chatInputCommand;
