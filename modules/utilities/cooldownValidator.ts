// Class & type imports
import type { SavedApplicationCommand, SavedMessageComponent, SavedModal } from "../../types";
import type { CooldownCollections } from "../../types";

// Data imports
import { cooldowns } from "#variables";

// External libraries imports
import {
	Collection,
	CommandInteraction,
	InteractionType,
	MessageComponentInteraction,
	ModalSubmitInteraction,
} from "discord.js";

/**
 * Updates the cooldowns of the application command if needed
 * @param type The type of the interaction the cooldown belongs to
 * @param applicationCommand The application command to update
 * @param interaction The interaction that caused the update
 * @see {@link CommandInteraction} | {@link SavedApplicationCommand}
 */
export async function updateCooldown(
	type: "ApplicationCommand",
	applicationCommand: SavedApplicationCommand,
	interaction: CommandInteraction,
): Promise<void>;

/**
 * Updates the cooldowns of the message component if needed
 * @param type The type of the interaction the cooldown belongs to
 * @param messageComponent The message component to update
 * @param interaction The interaction that caused the update
 * @see {@link MessageComponentInteraction} | {@link SavedMessageComponent}
 */
export async function updateCooldown(
	type: "MessageComponent",
	messageComponent: SavedMessageComponent,
	interaction: MessageComponentInteraction,
): Promise<void>;

/**
 * Updates the cooldowns of the modal if needed
 * @param type The type of the interaction the cooldown belongs to
 * @param modal The modal to update
 * @param interaction The interaction that caused the update
 * @see {@link ModalSubmitInteraction} | {@link SavedModal}
 */
export async function updateCooldown(
	type: "ModalSubmit",
	modal: SavedModal,
	interaction: ModalSubmitInteraction,
): Promise<void>;

export async function updateCooldown(
	type: keyof typeof cooldowns,
	x: SavedApplicationCommand | SavedMessageComponent | SavedModal,
	interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
) {
	if (typeof x.cooldown !== "undefined" && (x.cooldown.servers || x.cooldown.users)) {
		/** Name of the interactable element */
		const name = "name" in x ? x.name : x.data.name;

		/** Old cooldowns of the interactable element */
		const oldCooldowns = cooldowns[type].get(name);

		if (oldCooldowns) {
			if (interaction.inGuild() && x.cooldown.servers) {
				if (!oldCooldowns.servers) {
					oldCooldowns.servers = new Collection();
				}

				await interaction.client.guilds.fetch();

				oldCooldowns.servers.set(interaction.guild!.id, interaction.createdAt);
			} else if (x.cooldown.users) {
				if (!oldCooldowns.users) {
					oldCooldowns.users = new Collection();
				}

				oldCooldowns.users.set(interaction.user.id, interaction.createdAt);
			}
		} else {
			/** Cooldown object */
			const cooldownObject: CooldownCollections = {};

			if (x.cooldown.servers) {
				cooldownObject.servers = new Collection();

				await interaction.client.guilds.fetch();

				cooldownObject.servers.set(interaction.guild!.id, interaction.createdAt);
			} else if (x.cooldown.users) {
				cooldownObject.users = new Collection();

				cooldownObject.users.set(interaction.user.id, interaction.createdAt);
			}

			cooldowns[type].set(name, cooldownObject);
		}
	}
}

/**
 * Checks whether the user can use the application command
 * @param applicationCommand The application command to check
 * @param interaction The interaction the cooldown needs to be checked for
 * @returns Whether the user can use the application command
 * @see {@link CommandInteraction} | {@link SavedApplicationCommand}
 */
export default async function validateCooldown(
	applicationCommand: SavedApplicationCommand,
	interaction: CommandInteraction,
): Promise<true | number>;

/**
 * Checks whether the user can use the message component
 * @param messageComponent The message component to check
 * @param interaction The interaction the cooldown needs to be checked for
 * @returns Whether the user can use the application command
 * @see {@link MessageComponentInteraction} | {@link SavedMessageComponent}
 */
export default async function validateCooldown(
	messageComponent: SavedMessageComponent,
	interaction: MessageComponentInteraction,
): Promise<true | number>;

/**
 * Checks whether the user can submit the modal
 * @param modal The modal to check
 * @param interaction The interaction the cooldown needs to be checked for
 * @returns Whether the user can submit the modal
 * @see {@link ModalSubmitInteraction} | {@link SavedModal}
 */
export default async function validateCooldown(
	modal: SavedModal,
	interaction: ModalSubmitInteraction,
): Promise<true | number>;

export default async function validateCooldown(
	x: SavedApplicationCommand | SavedMessageComponent | SavedModal,
	interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
) {
	if (typeof x.cooldown !== "undefined") {
		/** Old cooldowns of the interactable element */
		const oldCooldowns = cooldowns[InteractionType[interaction.type] as keyof typeof cooldowns].get(
			"name" in x ? x.name : x.data.name,
		);

		if (!(oldCooldowns && (oldCooldowns.servers || oldCooldowns.users))) {
			return true;
		}

		if (interaction.inGuild()) {
			if (oldCooldowns.servers && x.cooldown.servers) {
				await interaction.client.guilds.fetch();

				/** Time difference */
				const validation =
					(oldCooldowns.servers.get(interaction.guild!.id)?.getTime() ?? 0) +
					x.cooldown.servers * 1000 -
					interaction.createdAt.getTime();

				return validation < 0 ? true : validation / 1000;
			}
		} else {
			if (oldCooldowns.users && x.cooldown.users) {
				/** Time difference*/
				const validation =
					(oldCooldowns.users.get(interaction.user.id)?.getTime() ?? 0) +
					x.cooldown.users * 1000 -
					interaction.createdAt.getTime();

				return validation < 0 ? true : validation / 1000;
			}
		}
	}

	return true;
}
