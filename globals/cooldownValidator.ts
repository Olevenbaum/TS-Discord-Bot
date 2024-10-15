// Global imports
import { cooldowns } from "./variables";

// Type imports
import {
    Collection,
    CommandInteraction,
    InteractionType,
    MessageComponentInteraction,
    ModalSubmitInteraction,
} from "discord.js";
import { SavedApplicationCommand } from "../types/applicationCommands";
import { SavedMessageComponent } from "../types/components";
import { SavedModal } from "../types/modals";
import { CooldownCollections } from "types/others";

declare global {
    /**
     * Updates the cooldowns of the application command if needed
     * @param type The type of the interaction the cooldown belongs to
     * @param applicationCommand The application command to update
     * @param interaction The interaction that caused the update
     */
    function updateCooldown(
        type: "ApplicationCommand",
        applicationCommand: SavedApplicationCommand,
        interaction: CommandInteraction
    ): Promise<void>;

    /**
     * Updates the cooldowns of the message component if needed
     * @param type The type of the interaction the cooldown belongs to
     * @param messageComponent The message component to update
     * @param interaction The interaction that caused the update
     */
    function updateCooldown(
        type: "MessageComponent",
        messageComponent: SavedMessageComponent,
        interaction: MessageComponentInteraction
    ): Promise<void>;

    /**
     * Updates the cooldowns of the modal if needed
     * @param type The type of the interaction the cooldown belongs to
     * @param modal The modal to update
     * @param interaction The interaction that caused the update
     */
    function updateCooldown(
        type: "ModalSubmit",
        modal: SavedModal,
        interactiion: ModalSubmitInteraction
    ): Promise<void>;

    /**
     * Checks whether the user can use the application command
     * @param applicationCommand The application command to check
     * @param interaction The interaction the cooldown needs to be checked for
     * @returns Whether the user can use the application command
     */
    function validateCooldown(
        applicationCommand: SavedApplicationCommand,
        interaction: CommandInteraction
    ): Promise<true | number>;

    /**
     * Checks whether the user can use the message component
     * @param messageComponent The message component to check
     * @param interaction The interaction the cooldown needs to be checked for
     * @returns Whether the user can use the application command
     */
    function validateCooldown(
        messageComponent: SavedMessageComponent,
        interaction: MessageComponentInteraction
    ): Promise<true | number>;

    /**
     * Checks whether the user can submit the modal
     * @param modal The modal to check
     * @param interaction The interaction the cooldown needs to be checked for
     * @returns Whether the user can submit the modal
     */
    function validateCooldown(modal: SavedModal, interaction: ModalSubmitInteraction): Promise<true | number>;
}

global.updateCooldown = async function (
    type: keyof typeof cooldowns,
    x: SavedApplicationCommand | SavedMessageComponent | SavedModal,
    interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction
): Promise<void> {
    // Check if the interactable element has a cooldown
    if (typeof x.cooldown !== "undefined" && (x.cooldown.servers || x.cooldown.users)) {
        /**
         * Name of the interactable element
         */
        const name = "name" in x ? x.name : x.data.name;

        /**
         * Old cooldowns of the interactable element
         */
        const oldCooldowns = cooldowns[type].get(name);

        // Check if there are any active cooldowns
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
            /**
             * Cooldown object
             */
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
};

global.validateCooldown = async function (
    x: SavedApplicationCommand | SavedMessageComponent | SavedModal,
    interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction
): Promise<true | number> {
    // Check if the interactable element has a cooldown
    if (typeof x.cooldown !== "undefined") {
        /**
         * Old cooldowns of the interactable element
         */
        const oldCooldowns = cooldowns[InteractionType[interaction.type] as keyof typeof cooldowns].get(
            "name" in x ? x.name : x.data.name
        );

        // Check if there are any active cooldowns
        if (!(oldCooldowns && (oldCooldowns.servers || oldCooldowns.users))) {
            return true;
        }

        // Check if there is an active server cooldown
        if (interaction.inGuild()) {
            if (oldCooldowns.servers && x.cooldown.servers) {
                await interaction.client.guilds.fetch();

                const validation =
                    (oldCooldowns.servers.get(interaction.guild!.id)?.getTime() ?? 0) +
                    x.cooldown.servers * 1000 -
                    interaction.createdAt.getTime();

                return validation < 0 ? true : validation / 1000;
            } else {
                return true;
            }
        } else {
            if (oldCooldowns.users && x.cooldown.users) {
                const validation =
                    (oldCooldowns.users.get(interaction.user.id)?.getTime() ?? 0) +
                    x.cooldown.users * 1000 -
                    interaction.createdAt.getTime();

                return validation < 0 ? true : validation / 1000;
            } else {
                return true;
            }
        }
    }

    // Return true
    return true;
};

export {};
