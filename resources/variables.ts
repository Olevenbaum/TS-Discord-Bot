// Class & type imports
import {
	Configuration,
	Cooldowns,
	SavedActionRow,
	SavedApplicationCommand,
	SavedApplicationCommandType,
	SavedButtonComponent,
	SavedChannelSelectMenuComponent,
	SavedChatInputCommand,
	SavedComponent,
	SavedComponentType,
	SavedInteractionType,
	SavedMentionableSelectMenuComponent,
	SavedMessageCommand,
	SavedModal,
	SavedRoleSelectMenuComponent,
	SavedSelectMenuComponent,
	SavedStringSelectMenuComponent,
	SavedTextInputComponent,
	SavedUserCommand,
	SavedUserSelectMenuComponent,
} from "../types";

// Data imports
import botConfiguration from "../configuration/configuration.json";
import databaseConfiguration from "../configuration/database.json";
import discordConfiguration from "../configuration/discord.json";
import paths from "../configuration/paths.json";

// External libraries imports
import { ApplicationCommandType, Collection, ComponentType, InteractionType, Snowflake } from "discord.js";

/**
 * Collection of locally saved application commands
 * @see {@link ApplicationCommandType} | {@link Collection} | {@link SavedApplicationCommand}
 */
export const applicationCommands: Partial<Record<ApplicationCommandType, Collection<string, SavedApplicationCommand>>> =
	{
		/**
		 * Chat input application commands
		 * @see {@link Collection} | {@link SavedChatInputCommand}
		 */
		1: new Collection<string, SavedChatInputCommand>(),

		/**
		 * Message application commands
		 * @see {@link Collection} | {@link SavedMessageCommand}
		 */
		2: new Collection<string, SavedMessageCommand>(),

		/**
		 * User application commands
		 * @see {@link Collection} | {@link SavedUserCommand}
		 */
		3: new Collection<string, SavedUserCommand>(),
	};

/**
 * Collection of locally saved application command types
 * @see {@link ApplicationCommandType} | {@link Collection} | {@link SavedApplicationCommandType}
 */
export const applicationCommandTypes: Collection<ApplicationCommandType, SavedApplicationCommandType> =
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
export const components: Partial<Record<ComponentType, Collection<string, SavedComponent>>> = {
	/**
	 * Action rows
	 * @see {@link Collection} | {@link SavedActionRow}
	 */
	1: new Collection<string, SavedActionRow>(),

	/**
	 * Button components
	 * @see {@link Collection} | {@link SavedButtonComponent}
	 */
	2: new Collection<string, SavedButtonComponent>(),

	/**
	 * Channel select components
	 * @see {@link Collection} | {@link SavedChannelSelectComponent}
	 */
	3: new Collection<string, SavedChannelSelectMenuComponent>(),

	/**
	 * Mentionable select components
	 * @see {@link Collection} | {@link SavedMentionableSelectComponent}
	 */
	4: new Collection<string, SavedMentionableSelectMenuComponent>(),

	/**
	 * Role select components
	 * @see {@link Collection} | {@link SavedRoleSelectMenuComponent}
	 */
	5: new Collection<string, SavedRoleSelectMenuComponent>(),

	/**
	 * Select menu components
	 * @see {@link Collection} | {@link SavedSelectMenuComponent}
	 */
	6: new Collection<string, SavedSelectMenuComponent>(),

	/**
	 * String select components
	 * @see {@link Collection} | {@link SavedStringSelectComponent}
	 */
	7: new Collection<string, SavedStringSelectMenuComponent>(),

	/**
	 * Text input components
	 * @see {@link Collection} | {@link SavedTextInputComponent}
	 */
	8: new Collection<string, SavedTextInputComponent>(),

	/**
	 * User select components
	 * @see {@link Collection} | {@link SavedUserSelectComponent}
	 */
	9: new Collection<string, SavedUserSelectMenuComponent>(),
};

/**
 * Collection of locally saved component types
 * @see {@link Collection} | {@link ComponentType} | {@link SavedComponentType}
 */
export const componentTypes: Collection<ComponentType, SavedComponentType> = new Collection();

/**
 * Configuration of the bot, constants and restrictions provided by discord and paths to various files
 * @see {@link Configuration}
 */
export const configuration: Configuration = {
	bot: botConfiguration,
	database: databaseConfiguration,
	discord: Object.fromEntries(
		Object.entries(discordConfiguration).map(([key, value]) =>
			key === "tokenRegex" ? [key, new RegExp(value as string)] : [key, value],
		),
	),
	paths,
};

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
 * Collection of locally saved modals
 * @see {@link Collection} | {@link SavedModal}
 */
export const modals: Collection<string, SavedModal> = new Collection();

/**
 * Collection of timestamps for any purpose
 * @see {@link Collection}
 */
export const timestamps: Collection<string, Date> = new Collection();
