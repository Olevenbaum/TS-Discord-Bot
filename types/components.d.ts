// Type imports
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	ChannelSelectMenuInteraction,
	ChannelType,
	ComponentBuilder,
	ComponentEmojiResolvable,
	ComponentType,
	MentionableSelectMenuBuilder,
	MentionableSelectMenuInteraction,
	MessageActionRowComponent,
	MessageActionRowComponentBuilder,
	MessageComponentBuilder,
	MessageComponentInteraction,
	MessageComponentType,
	ModalActionRowComponent,
	ModalActionRowComponentBuilder,
	ModalComponentBuilder,
	RoleSelectMenuBuilder,
	RoleSelectMenuInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
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
 * Options that can be passed when creating a channel select component
 */
interface ChannelSelectComponentCreateOptions extends SelectComponentCreateOptions {
	/**
	 * Channel type(s) that the channel can be selected from
	 */
	channelTypes?: ChannelType[];
}

/**
 * Options that can be passed when creating a button component
 */
interface ButtonComponentCreateOptions extends MessageComponentCreateOptions {
	/**
	 * Emoji being shown on the button component
	 *
	 * **This option overwrites the label option!**
	 */
	emoji?: ComponentEmojiResolvable;

	/**
	 * Label of the button component
	 */
	label?: string;

	/**
	 * Style of the button component
	 */
	style?: ButtonStyle;

	/**
	 * URL linked to the button component
	 */
	url?: string;
}

/**
 * Options that can be passed when creating a component
 */
type ComponentCreateOptions = Record<string, any>;

/**
 * Options that can be passed when creating a mentionable select component
 */
interface MentionableSelectComponentCreateOptions extends SelectComponentCreateOptions {}

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
 * Options that can be passed when creating a modal
 */
interface ModalCreateOptions {
	/**
	 * The title of the modal
	 */
	title?: string;
}

/**
 * Options that can be passed when creating a role select component
 */
interface RoleSelectComponentCreateOptions extends SelectComponentCreateOptions {}

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
	 * @param options Options that modify the included components
	 * @returns The action row builder
	 */
	create(options?: ActionRowCreateOptions): ActionRowBuilder;
}

/**
 * Button component imported from local file
 */
interface SavedButtonComponent extends SavedMessageComponent {
	/**
	 * Type of the button message component
	 */
	type: ComponentType.Button;

	/**
	 * Creates the button component
	 * @param options Options that modify the button component
	 * @returns The button builder
	 */
	create(options?: ButtonComponentCreateOptions): ButtonBuilder;

	/**
	 * Handles the response to the button interaction
	 * @param interaction The button interaction to response to
	 */
	execute(interaction: ButtonInteraction): Promise<void>;
}

/**
 * Channel select component imported from local file
 */
interface SavedChannelSelectComponent extends SavedMessageComponent {
	/**
	 * Type of the channel select component
	 */
	type: ComponentType.ChannelSelect;

	/**
	 * Creates the channel select component
	 * @param options The options that modify the channel select component
	 * @returns The channel select builder
	 */
	create(options?: ChannelSelectComponentCreateOptions): ChannelSelectMenuBuilder;

	/**
	 * Handles the response to the channel select component interaction
	 * @param interaction The channel select component interaction to response to
	 */
	execute(interaction: ChannelSelectMenuInteraction): Promise<void>;
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
	 * @returns The component builder
	 */
	create(options?: ComponentCreateOptions): ComponentBuilder;
}

/**
 * Mentionable select component imported from local file
 */
interface SavedMentionableSelectComponent extends SavedMessageComponent {
	/**
	 * Type of the mentionable select component
	 */
	type: ComponentType.MentionableSelect;

	/**
	 * Creates the mentionable select component
	 * @param options The options that modify the mentionable select component
	 * @returns The mentionable select builder
	 */
	create(options?: MentionableSelectComponentCreateOptions): MentionableSelectMenuBuilder;

	/**
	 * Handles the response to the mentionable select component interaction.
	 * @param interaction The mentionable select component interaction to respond to
	 */
	execute(interaction: MentionableSelectMenuInteraction): Promise<void>;
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
	 * @param options The options to modify the message component
	 * @returns The message component builder
	 */
	create(options?: MessageComponentCreateOptions): MessageActionRowComponentBuilder;

	/**
	 * Handles the response to the message component interaction
	 * @param interaction The message component interaction to response to
	 */
	execute(interaction: MessageComponentInteraction): Promise<void>;
}

/**
 * Message component type imported from local file
 */
interface SavedMessageComponentType {
	/**
	 * Message component type
	 */
	type: MessageComponentType;

	/**
	 * Handles the interaction with the message component type
	 * @param interaction The interaction to response to
	 */
	execute(interaction: MessageComponentInteraction): Promise<void>;
}

/**
 * Modal component imported from local file
 */
interface SavedModalComponent extends SavedComponent {
	/**
	 * Type of the modal component
	 */
	type: Omit<ComponentType[keyof typeof ComponentType], MessageComponentType>;

	/**
	 * Creates the modal component
	 * @param options The options to modify the modal component
	 * @returns The modal action row builder
	 */
	create(options?: ComponentCreateOptions): ModalActionRowComponentBuilder;
}

/**
 * Role select component imported from local file
 */
interface SavedRoleSelectComponent extends SavedMessageComponent {
	/**
	 * Type of the role select component
	 */
	type: ComponentType.RoleSelect;

	/**
	 * Creates the role select component
	 * @param options The options to modify the roles select component
	 * @returns The role select builder
	 */
	create(options?: RoleSelectComponentCreateOptions): RoleSelectMenuBuilder;

	/**
	 * Handles the response to the role select component interaction
	 * @param interaction The role select component interaction to response to
	 */
	execute(interaction: RoleSelectMenuInteraction): Promise<void>;
}

/**
 * Select menu component imported from local file
 */
type SavedSelectMenuComponent =
	| SavedChannelSelectComponent
	| SavedMentionableSelectComponent
	| SavedStringSelectComponent
	| SavedRoleSelectComponent;

/**
 * String select component imported from local file
 */
interface SavedStringSelectComponent extends SavedMessageComponent {
	/**
	 * Options of the string select component
	 */
	options: string[];

	/**
	 * Type of the string select component
	 */
	type: ComponentType.StringSelect;

	/**
	 * Creates the string select component
	 * @param options The options to modify the string select component
	 * @returns The string select builder
	 */
	create(options?: StringSelectComponentCreateOptions): StringSelectMenuBuilder;

	/**
	 * Handles the response to the string select component interaction
	 * @param interaction The string select component interaction to response to
	 */
	execute(interaction: StringSelectMenuInteraction): Promise<void>;
}

/**
 * Text input component imported from local file
 */
interface SavedTextInputComponent extends SavedModalComponent {
	/**
	 * Type of the text input component
	 */
	type: ComponentType.TextInput;

	/**
	 * Creates the text input component
	 * @param options The options to modify the text input component
	 * @returns The text input component builder
	 */
	create(options?: TextInputComponentCreateOptions): TextInputBuilder;
}

/**
 * User select component imported from local file
 */
interface SavedUserSelectComponent extends SavedMessageComponent {
	/**
	 * Type of the user select component
	 */
	type: ComponentType.UserSelect;

	/**
	 * Creates the user select component
	 * @param options The options to modify the user select component
	 * @returns The user select builder
	 */
	create(options?: UserSelectComponentCreateOptions): UserSelectMenuBuilder;

	/**
	 * Handles the response to the user select component interaction
	 * @param interaction The user select component interaction to response to
	 */
	execute(interaction: UserSelectMenuInteraction): Promise<void>;
}

/**
 * Options that can be passed when creating a select component
 */
interface SelectComponentCreateOptions extends MessageComponentCreateOptions {
    /**
     * The maximal number of options that have to be chosen
     */
    maximalValues?: number;

    /**
     * The minimal number of options that have to be chosen
     */
    minimalValues?: number;

    /**
     * The text that is written in the select menu if it is empty
     */
    placeholder?: string;
}

/**
 * Options that can be passed when creating a string select component
 */
interface StringSelectComponentCreateOptions extends SelectComponentCreateOptions {
    /**
     * Options the user can choose from, overwrites the options of string select component
     */
    options?: string[];
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

/**
 * Options that can be passed when creating a user select component
 */
interface UserSelectComponentCreateOptions extends SelectComponentCreateOptions {}