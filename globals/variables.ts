// Type imports
import { ApplicationCommandType, Collection, ComponentType, InteractionType, Snowflake } from "discord.js";
import { SavedApplicationCommand, SavedApplicationCommandType } from "../types/applicationCommands";
import { ComponentCollection } from "../types/components";
import { SavedInteractionType } from "../types/interfaces";
import { SavedModal } from "../types/modals";
import { Cooldowns } from "../types/others";

/**
 * Collection of locally saved application command types
 */
export const applicationCommandTypes: Collection<ApplicationCommandType, SavedApplicationCommandType> =
    new Collection();

/**
 * Collection of locally saved application commands
 */
export const applicationCommands: Collection<string, SavedApplicationCommand> = new Collection();

/**
 * IDs of users unable to interact with the bot
 */
export const blockedUsers: Snowflake[] = [];

/**
 * Collection of locally saved (message) components
 */
export const components = Object.fromEntries(
    Object.keys(ComponentType)
        .filter((key) => isNaN(parseInt(key)))
        .map((componentType) => [componentType, new Collection()])
) as ComponentCollection;

/**
 * Collection of cooldowns for servers and users
 */
export const cooldowns = Object.fromEntries(
    Object.keys(InteractionType)
        .filter((key) => isNaN(parseInt(key)))
        .map((interactionType) => [interactionType, new Collection()])
) as Cooldowns;

/**
 * Collection of saved interaction types
 */
export const interactionTypes: Collection<InteractionType, SavedInteractionType> = new Collection();

/**
 * Collection of locally saved modals
 */
export const modals: Collection<string, SavedModal> = new Collection();

/**
 * Collectionn of timestamps for any purpose
 */
export const timestamps: Collection<string, Date> = new Collection();
