// Data imports
import botConfiguration from "../configuration/configuration.json";
import discordConfiguration from "../configuration/discordConfiguration.json";
import paths from "../configuration/paths.json";

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
import { Configuration } from "../types/configuration";
import { SavedModal } from "../types/modals";
import { ConsoleCommand, Cooldowns, SavedInteractionType } from "../types/others";

/**
 * Collection of locally saved application commands
 * @see {@link ApplicationCommandType} | {@link Collection} | {@link SavedApplicationCommand}
 */
export const applicationCommands: Partial<
	Record<keyof typeof ApplicationCommandType, Collection<string, SavedApplicationCommand>>
> = {
	/**
	 * Chat input application commands
	 * @see {@link Collection} | {@link SavedChatInputCommand}
	 */
	ChatInput: new Collection<string, SavedChatInputCommand>(),

	/**
	 * Message application commands
	 * @see {@link Collection} | {@link SavedMessageCommand}
	 */
	Message: new Collection<string, SavedMessageCommand>(),

	/**
	 * User application commands
	 * @see {@link Collection} | {@link SavedUserCommand}
	 */
	User: new Collection<string, SavedUserCommand>(),
};

/**
 * Collection of locally saved application command types
 * @see {@link ApplicationCommandType} | {@link Collection} | {@link SavedApplicationCommandType}
 */
export const applicationCommandTypes: Collection<keyof typeof ApplicationCommandType, SavedApplicationCommandType> =
	new Collection();

/**
 * IDs of users unable to interact with the bot
 * @see {@link Snowflake}
 */
export const blockedUsers: { global: Snowflake[]; guilds: Record<Snowflake, Snowflake[]> } = { global: [], guilds: {} };

/**
 * Collection of locally saved (message) components
 * @see {@link ComponentType} | {@link Collection} | {@link SavedComponent}
 */
export const components: Partial<Record<keyof typeof ComponentType, Collection<string, SavedComponent>>> = {
	/**
	 * Action rows
	 * @see {@link Collection} | {@link SavedActionRow}
	 */
	ActionRow: new Collection<string, SavedActionRow>(),

	/**
	 * Button components
	 * @see {@link Collection} | {@link SavedButtonComponent}
	 */
	Button: new Collection<string, SavedButtonComponent>(),

	/**
	 * Channel select components
	 * @see {@link Collection} | {@link SavedChannelSelectComponent}
	 */
	ChannelSelect: new Collection<string, SavedChannelSelectComponent>(),

	/**
	 * Mentionable select components
	 * @see {@link Collection} | {@link SavedMentionableSelectComponent}
	 */
	MentionableSelect: new Collection<string, SavedMentionableSelectComponent>(),

	/**
	 * Role select components
	 * @see {@link Collection} | {@link SavedRoleSelectComponent}
	 */
	RoleSelect: new Collection<string, SavedRoleSelectComponent>(),

	/**
	 * Select menu components
	 * @see {@link Collection} | {@link SavedSelectMenuComponent}
	 */
	SelectMenu: new Collection<string, SavedSelectMenuComponent>(),

	/**
	 * String select components
	 * @see {@link Collection} | {@link SavedStringSelectComponent}
	 */
	StringSelect: new Collection<string, SavedStringSelectComponent>(),

	/**
	 * Text input components
	 * @see {@link Collection} | {@link SavedTextInputComponent}
	 */
	TextInput: new Collection<string, SavedTextInputComponent>(),

	/**
	 * User select components
	 * @see {@link Collection} | {@link SavedUserSelectComponent}
	 */
	UserSelect: new Collection<string, SavedUserSelectComponent>(),
};

/**
 * Configuration of the bot, constants and restrictions provided by discord and paths to various files
 * @see {@link Configuration}
 */
export const configuration: Configuration = {
	bot: botConfiguration,
	discord: Object.fromEntries(
		Object.entries(discordConfiguration).map(([key, value]) =>
			key === "tokenRegex" ? [key, new RegExp(value as string)] : [key, value],
		),
	),
	paths,
};

/**
 * Console commands for usage in the console
 * @see {@link ConsoleCommand}
 */
export const consoleCommands: ConsoleCommand[] = [];

/**
 * Collection of cooldowns for servers and users
 * @see {@link Cooldowns}
 */
export const cooldowns = Object.fromEntries(
	Object.keys(InteractionType)
		.filter((key) => isNaN(parseInt(key)))
		.map((interactionType) => [interactionType, new Collection()]),
) as Cooldowns;

/**
 * Collection of locally saved interaction types
 * @see {@link Collection} | {@link InteractionType} | {@link SavedInteractionType}
 */
export const interactionTypes: Collection<keyof typeof InteractionType, SavedInteractionType> = new Collection();

/**
 * Collection of locally saved message component types
 * @see {@link Collection} | {@link MessageComponentType} | {@link SavedMessageComponentType}
 */
export const messageComponentTypes: Collection<MessageComponentType, SavedMessageComponentType> = new Collection();

/**
 * Collection of locally saved modals
 * @see {@link Collection} | {@link SavedModal}
 */
export const modals: Collection<string, SavedModal> = new Collection();

/**
 * Collection of timestamps for any purpose
 * @see {@link Collection}
 */
export const timestamps: Collection<string, Date> = new Collection();
