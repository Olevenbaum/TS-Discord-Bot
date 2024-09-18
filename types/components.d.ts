// Type imports
import {
    ActionRowBuilder,
    ComponentBuilder,
    ComponentType,
    MessageComponentBuilder,
    MessageComponentInteraction,
    MessageComponentType,
    ModalActionRowComponent,
    ModalActionRowComponentBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import { Configuration } from "./configuration";
import { CooldownObject } from "./others";

/**
 * Options that can be passed when creating an action row
 */
interface ActionRowCreateOptions extends ComponentCreateOptions {
    /**
     * Options that are passed to every component included in the action row
     */
    general?: MessageComponentCreateOptions;

    /**
     * Options that are passed to the component in the action row whose name matches the key
     */
    [key: string]: MessageComponentCreateOptions;
}

/**
 * Options that can be passed when creating a component
 */
type ComponentCreateOptions = Record<string, any>;

/**
 * Collection of components that can be used in the bot
 */
type ComponentCollection = Record<keyof typeof ComponentType, Collection<string, Component>>;

/**
 * Options that can be passed when creating a message component
 */
interface MessageComponentCreateOptions extends ComponentCreateOptions {
    /**
     * Index of the message component if it needs to be added multiple times to one message or action row
     */
    customIdIndex?: number;

    /**
     * Whether the message component should be disabled or not
     */
    disabled?: boolean;
}

/**
 * Action row imported from local file
 */
interface SavedActionRow extends SavedComponent {
    /**
     * Name and number of the included components
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
        type: ComponentType;
    }[];

    /**
     * Type of the action row
     */
    type: ComponentType.ActionRow;

    /**
     * Creates an action row including the components listed in the **includedComponents** property
     * @param configuration The configuration of the project and bot
     * @param options The options that modify the included components
     * @returns The action row builder
     */
    create(configuration: Configuration, options?: ActionRowCreateOptions): ActionRowBuilder;
}

/**
 * Component imported from local file
 */
interface SavedComponent {
    /**
     * Name of the component
     */
    name: string;

    /**
     * Type of the component
     */
    type: ComponentType;

    /**
     * Creates the component
     * @param options The options to modify the component
     * @param configuration The configuration of the project and bot
     * @returns The component builder
     */
    create(configuration: Configuration, options?: ComponentCreateOptions): ComponentBuilder;
}

/**
 * Message component imported from local file
 */
interface SavedMessageComponent extends SavedComponent {
    /**
     * The time any or a specific user has to wait to use this message component again
     */
    cooldown?: CooldownObject;

    /**
     * Type of the message component
     */
    type: MessageComponentType;

    /**
     * Creates the message component
     * @param configuration The configuration of the project and bot
     * @param options The options to modify the message component
     * @returns The message component builder
     */
    create(configuration: Configuration, options?: MessageComponentCreateOptions): MessageComponentBuilder;

    /**
     * Handles the response to the message component interaction
     * @param configuration The configuration of the project and bot
     * @param interaction The message component interaction to response to
     */
    execute(configuration: Configuration, interaction: MessageComponentInteraction): Promise<void>;
}

/**
 * Saved modal component imported from local file
 */
interface SavedModalComponent extends SavedComponent {
    /**
     * Type of the modal component
     */
    type: Omit<ComponentType, MessageComponentType>;

    /**
     * Creates the modal component
     * @param options The options to modify the modal component
     * @param configuration The configuration of the project and bot
     * @returns The modal component builder
     */
    create(configuration: Configuration, options?: ModalComponentCreateOptions): ModalActionRowComponentBuilder;
}

/**
 * Message components that can be included in action rows in modals
 */
type SavedModalComponent = SavedTextInputComponent;

/**
 * Text input component imported from local file
 */
interface SavedTextInputComponent extends SavedComponent {
    /**
     * Type of the text input component
     */
    type: ComponentType.TextInput;

    /**
     * Creates the text input component
     * @param configuration The configuration of the project and bot
     * @param options The options to modify the text input component
     * @returns The text input component builder
     */
    create(configuration: Configuration, options?: TextInputComponentCreateOptions): TextInputBuilder;
}

/**
 * Options that can be passed when creating a text input component
 */
interface TextInputComponentCreateOptions extends ComponentCreateOptions {
    /**
     * Label of the text input component
     */
    label?: string;

    /**
     * Maximal length of the text that can be typed in the text input component
     */
    maximalLength?: number;

    /**
     * Minimal length of the text that can be typed in the text input component
     */
    minimalLength?: number;

    /**
     * Text placed in the text input component if nothing was typed
     */
    placeholder?: string;

    /**
     * Whether this text input component has to be filled to submit the modal
     */
    required?: boolean;

    /**
     * The style of the text input component
     */
    style?: TextInputStyle;

    /**
     * The value of the text input component
     */
    value?: string;
}
