// Type imports
import { ButtonStyle, ChannelType, ComponentEmojiResolvable, TextInputStyle } from "discord.js";

/**
 * Options that can be passed when creating an action row
 * @see {@linkcode ComponentCreateOptions}
 */
interface ActionRowCreateOptions extends ComponentCreateOptions {
	/**
	 * Options that are passed to every component included in the action row
	 * @see {@linkcode ComponentCreateOptions}
	 */
	general?: ComponentCreateOptions;

	/**
	 * Options that are passed to the component in the action row whose name matches the key
	 * @see {@linkcode ComponentCreateOptions}
	 */
	[key: string]: ComponentCreateOptions;
}

/**
 * Options that can be passed when creating a button component
 * @see {@linkcode MessageComponentCreateOptions}
 */
interface ButtonComponentCreateOptions extends MessageComponentCreateOptions {
	/**
	 * Emoji being shown on the button component
	 *
	 * **This option overwrites the label option!**
	 * @see {@linkcode ComponentEmojiResolvable}
	 */
	emoji?: ComponentEmojiResolvable;

	/** Label of the button component */
	label?: string;

	/**
	 * Style of the button component
	 * @see {@linkcode ButtonStyle}
	 */
	style?: ButtonStyle;

	/** URL linked to the button component */
	url?: string;
}

/**
 * Options that can be passed when creating a channel select component
 * @see {@linkcode SelectMenuComponentCreateOptions}
 */
interface ChannelSelectMenuComponentCreateOptions extends SelectMenuComponentCreateOptions {
	/**
	 * Channel types that the channel can be selected from
	 * @see {@linkcode ChannelType}
	 */
	channelTypes?: ChannelType[];
}

/** Options that can be passed when creating a component */
type ComponentCreateOptions = Record<string, any>;

/**
 * Options that can be passed when creating a mentionable select component
 * @see {@linkcode SelectMenuComponentCreateOptions}
 */
interface MentionableSelectMenuComponentCreateOptions extends SelectMenuComponentCreateOptions {}

/**
 * Options that can be passed when creating a message component
 * @see {@linkcode ComponentCreateOptions}
 */
interface MessageComponentCreateOptions extends ComponentCreateOptions {
	/** Index of the message component if it needs to be added multiple times to one message or action row */
	customIdIndex?: number;

	/** Whether the message component should be disabled or not */
	disabled?: boolean;
}

/**
 * Options that can be passed when creating a select component
 * @see {@linkcode MessageComponentCreateOptions}
 */
interface SelectMenuComponentCreateOptions extends MessageComponentCreateOptions {
	/** The maximal number of options that have to be chosen */
	maximalValues?: number;

	/** The minimal number of options that have to be chosen */
	minimalValues?: number;

	/** The text that is written in the select menu if it is empty */
	placeholder?: string;
}

/**
 * Options that can be passed when creating a string select component
 * @see {@linkcode SelectMenuComponentCreateOptions}
 */
interface StringSelectMenuComponentCreateOptions extends SelectMenuComponentCreateOptions {
	/** Options the user can choose from, overwrites the options of string select component */
	options?: string[];
}

/**
 * Options that can be passed when creating a text input component
 * @see {@linkcode ComponentCreateOptions}
 */
interface TextInputComponentCreateOptions extends ComponentCreateOptions {
	/** Label of the text input component */
	label?: string;

	/** Maximal length of the text that can be typed in the text input component */
	maximalLength?: number;

	/** Minimal length of the text that can be typed in the text input component */
	minimalLength?: number;

	/** Text placed in the text input component if nothing was typed */
	placeholder?: string;

	/** Whether this text input component has to be filled to submit the modal */
	required?: boolean;

	/**
	 * The style of the text input component
	 * @see {@linkcode TextInputStyle}
	 */
	style?: TextInputStyle;

	/** The value of the text input component */
	value?: string;
}

/**
 * Options that can be passed when creating a user select component
 * @see {@linkcode SelectMenuComponentCreateOptions}
 */
interface UserSelectMenuComponentCreateOptions extends SelectMenuComponentCreateOptions {}
