// Type imports
import {
    ApplicationCommandType,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    CommandInteraction,
    ContextMenuCommandBuilder,
    MessageContextMenuCommandInteraction,
    PermissionsBitField,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    UserContextMenuCommandInteraction,
} from "discord.js";
import { Configuration } from "./configuration";
import { CooldownObject } from "./others";

/**
 * Application command imported from local file
 */
interface SavedApplicationCommand {
    /**
     * Whether the application command can only be used by the owner or team members of the bot
     */
    owner?: boolean;

    /**
     * The time any or a specific user has to wait to use this application command again
     */
    cooldown?: CooldownObject;

    /**
     * Data of the application command
     */
    data:
        | SlashCommandBuilder
        | SlashCommandSubcommandBuilder
        | SlashCommandOptionsOnlyBuilder
        | SlashCommandSubcommandsOnlyBuilder
        | SlashCommandSubcommandGroupBuilder
        | ContextMenuCommandBuilder;

    /**
     * Type of the application command
     */
    type: ApplicationCommandType;

    /**
     * Handles the response to the application command's interaction
     * @param configuration The configuration of the project and bot
     * @param interaction The application command interaction to response to
     */
    execute(
        configuration: Configuration,
        interaction:
            | ChatInputCommandInteraction
            | MessageContextMenuCommandInteraction
            | UserContextMenuCommandInteraction
    ): Promise<void>;
}

/**
 * Application command type imported from local file
 */
interface SavedApplicationCommandType {
    /**
     * Application command type
     */
    type: ApplicationCommandType;

    /**
     * Handles the interaction with the application command type
     * @param configuration The configuration of the project and bot
     * @param interaction The interaction to be handled
     */
    execute(configuration: Configuration, interaction: CommandInteraction): Promise<void>;
}

/**
 * Chat input command imported from local file
 */
interface SavedChatInputCommand extends SavedApplicationCommand {
    /**
     * Data of the chat input command
     */
    data:
        | SlashCommandBuilder
        | SlashCommandSubcommandBuilder
        | SlashCommandOptionsOnlyBuilder
        | SlashCommandSubcommandsOnlyBuilder
        | SlashCommandSubcommandGroupBuilder;

    /**
     * Type of the chat input command
     */
    type: ApplicationCommandType.ChatInput;

    /**
     * Handles an autocomplete interaction
     * @param configuration The configuration of the project and bot
     * @param interaction The autocomplete interaction
     */
    autocomplete?(configuration: Configuration, interaction: AutocompleteInteraction): Promise<void>;

    /**
     * Handles the response to the chat input command interaction
     * @param configuration The configuration of the project and bot
     * @param interaction The chat input command interaction to response to
     */
    execute(configuration: Configuration, interaction: ChatInputCommandInteraction): Promise<void>;
}

/**
 * Message command imported from local file
 */
interface SavedMessageCommand extends SavedApplicationCommand {
    /**
     * Data of the message command
     */
    data: ContextMenuCommandBuilder;

    /**
     * Type of the message command
     */
    type: ApplicationCommandType.Message;

    /**
     * Handles the response to the message command interaction
     * @param configuration The configuration of the project and bot
     * @param interaction The message command interaction to respond to
     */
    execute(configuration: Configuration, interaction: MessageContextMenuCommandInteraction): Promise<void>;
}

/**
 * User command imported from local file
 */
interface SavedUserCommand extends SavedApplicationCommand {
    /**
     * Data of the user command
     */
    data: ContextMenuCommandBuilder;

    /**
     * Type of the user command
     */
    type: ApplicationCommandType.User;

    /**
     * Handles the response to the user command interaction
     * @param configuration The configuration of the project and bot
     * @param interaction The user context menu interaction to respond to
     */
    execute(configuration: Configuration, interaction: UserContextMenuCommandInteraction): Promise<void>;
}
