// Type imports
import {
    ApplicationCommandType,
    Collection,
    ComponentType,
    InteractionType,
    MessageComponentType,
    Snowflake,
} from "discord.js";
import {
    SavedApplicationCommand,
    SavedApplicationCommandType,
    SavedChatInputCommand,
    SavedMessageCommand,
    SavedUserCommand,
} from "../types/applicationCommands";
import {
    SavedActionRow,
    SavedButtonComponent,
    SavedChannelSelectComponent,
    SavedComponent,
    SavedMentionableSelectComponent,
    SavedMessageComponentType,
    SavedRoleSelectComponent,
    SavedSelectMenuComponent,
    SavedStringSelectComponent,
    SavedTextInputComponent,
    SavedUserSelectComponent,
} from "../types/components";
import { SavedModal } from "../types/modals";
import { Cooldowns, SavedInteractionType } from "../types/others";

/**
 * Collection of locally saved application command types
 */
export const applicationCommandTypes: Collection<ApplicationCommandType, SavedApplicationCommandType> =
    new Collection();

/**
 * Collection of locally saved application commands
 */
export const applicationCommands: Partial<
	Record<keyof typeof ApplicationCommandType, Collection<string, SavedApplicationCommand>>
> = {
	/**
	 * Chat input application commands
	 */
	ChatInput: new Collection<string, SavedChatInputCommand>(),

	/**
	 * Message application commands
	 */
	Message: new Collection<string, SavedMessageCommand>(),

	/**
	 * User application commands
	 */
	User: new Collection<string, SavedUserCommand>(),
};

/**
 * IDs of users unable to interact with the bot
 */
export const blockedUsers: { global: Snowflake[]; guilds: Record<Snowflake, Snowflake[]> } = { global: [], guilds: {} };

/**
 * Collection of locally saved (message) components
 */
export const components: Partial<Record<keyof typeof ComponentType, Collection<string, SavedComponent>>> = {
	/**
	 * Action rows
	 */
	ActionRow: new Collection<string, SavedActionRow>(),

	/**
	 * Button components
	 */
	Button: new Collection<string, SavedButtonComponent>(),

	/**
	 * Channel select components
	 */
	ChannelSelect: new Collection<string, SavedChannelSelectComponent>(),

	/**
	 * Mentionable select components
	 */
	MentionableSelect: new Collection<string, SavedMentionableSelectComponent>(),

	/**
	 * Role select components
	 */
	RoleSelect: new Collection<string, SavedRoleSelectComponent>(),

	/**
	 * Select menu components
	 */
	SelectMenu: new Collection<string, SavedSelectMenuComponent>(),

	/**
	 * String select components
	 */
	StringSelect: new Collection<string, SavedStringSelectComponent>(),

	/**
	 * Text input components
	 */
	TextInput: new Collection<string, SavedTextInputComponent>(),

	/**
	 * User select components
	 */
	UserSelect: new Collection<string, SavedUserSelectComponent>(),
};

/**
 * Collection of cooldowns for servers and users
 */
export const cooldowns = Object.fromEntries(
    Object.keys(InteractionType)
        .filter((key) => isNaN(parseInt(key)))
        .map((interactionType) => [interactionType, new Collection()])
) as Cooldowns;

/**
 * Collection of locally saved interaction types
 */
export const interactionTypes: Collection<InteractionType, SavedInteractionType> = new Collection();

/**
 * Collection of locally saved message component types
 */
export const messageComponentTypes: Collection<MessageComponentType, SavedMessageComponentType> = new Collection();

/**
 * Collection of locally saved modals
 */
export const modals: Collection<string, SavedModal> = new Collection();

/**
 * Collectionn of timestamps for any purpose
 */
export const timestamps: Collection<string, Date> = new Collection();
