// Type imports
import { ComponentType, MessageComponentType, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import { Configuration } from "./configuration";
import { CooldownObject } from "./others";

/**
 * Options that can be passed when creating a modal
 */
interface ModalCreateOptions {
    /**
     * General options that should be passed to all components
     */
    general?: Record<string, any>;

    /**
     * The title of the modal
     */
    title?: string;
}

/**
 * Modal imported from local file
 */
interface SavedModal {
    /**
     * The time any or a specific user has to wait to submit the same modal again
     */
    cooldown?: CooldownObject;

    /**
     * Modal action row components that are included in the modal
     */
    includedComponents: {
        /**
         * Number of components included in the action row
         */
        count: number;

        /**
         * Name of the component
         */
        name: string;

        /**
         * Type of the component
         */
        type: Omit<ComponentType, MessageComponentType>;
    }[];

    /**
     * Name of the modal
     */
    name: string;

    /**
     * Creates the modal
     * @param options The options to modify the modal
     * @param configuration The configuration of the project and bot
     * @returns The modal builder
     */
    create(configuration: Configuration, options: ModalCreateOptions): ModalBuilder;

    /**
     * Handles the response to the modal submit interaction
     * @param configuration The configuration of the project and bot
     * @param interaction The modal submit interaction to response to
     */
    execute(configuration: Configuration, interaction: ModalSubmitInteraction): Promise<void>;
}
