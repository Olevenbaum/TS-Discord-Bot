// Type imports
import {
    ApplicationCommand,
    ApplicationCommandType,
    BaseInteraction,
    ChatInputCommandInteraction,
    Client,
    ClientEvents,
    Collection,
    CommandInteraction,
    ComponentType,
    ContextMenuCommandBuilder,
    InteractionType,
    MessageComponentBuilder,
    MessageComponentInteraction,
    MessageComponentType,
    MessageContextMenuCommandInteraction,
    ModalBuilder,
    ModalSubmitInteraction,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    Snowflake,
    TeamMemberRole,
    UserContextMenuCommandInteraction,
} from "discord.js";
import { Interface } from "readline";

/**
 * Event type imported from local file
 */
interface SavedEventType {
    /**
     * Whether the event is called once
     */
    once?: boolean;

    /**
     * Type of the event
     */
    type: keyof ClientEvents;

    /**
     * Forwards the prompt to response to the event or handles it by itself
     * @param configuration The configuration of the project and bot
     * @param args The needed arguments to response to an interaction or the emitted event
     */
    execute(
        configuration: Configuration,
        ...args: any[] // TODO: Add correct types
    ): Promise<void>;
}
/**
 * Interaction type imported from local file
 */
interface SavedInteractionType {
    /**
     * Type of the interaction
     */
    type: InteractionType;

    /**
     * Forwards the interaction to be handled or handles it by itself
     * @param configuration The configuration of the project and bot
     * @param interaction The interaction to respond to
     */
    execute(configuration: Configuration, interaction: BaseInteraction): Promise<void>;
}
