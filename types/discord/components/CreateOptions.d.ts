// External libraries imports
import { ButtonStyle, ChannelType, type ComponentEmojiResolvable, TextInputStyle } from "discord.js";

// Internal class & type imports
import type { SavedActionRow } from "./SavedActionRow";
import type { SavedButtonComponent } from "./SavedButtonComponent";
import type { SavedChannelSelectMenuComponent } from "./SavedChannelSelectMenuComponent";
import type { SavedMentionableSelectMenuComponent } from "./SavedMentionableSelectMenuComponent";
import type { SavedMessageComponent } from "./SavedMessageComponent";
import type { SavedRoleSelectMenuComponent } from "./SavedRoleSelectMenuComponent";
import type { SavedSelectMenuComponent } from "./SavedSelectMenuComponent";
import type { SavedStringSelectMenuComponent } from "./SavedStringSelectMenuComponent";
import type { SavedTextInputComponent } from "./SavedTextInputComponent";
import type { SavedUserSelectMenuComponent } from "./SavedUserSelectMenuComponent";

/**
 * Options for customizing {@linkcode SavedActionRow | action row components} during creation. Action rows are
 * containers that hold multiple components in a horizontal layout. These options allow configuring the row itself and
 * its child components.
 * @see {@linkcode ComponentCreateOptions}
 */
interface ActionRowCreateOptions extends ComponentCreateOptions {
	/**
	 * Options applied to every component within this action row. Useful for setting common properties like disabled
	 * state across all components.
	 * @see {@linkcode ComponentCreateOptions}
	 */
	general?: ComponentCreateOptions;

	/**
	 * Component-specific options keyed by component name. Allows overriding general options for individual components
	 * in the row. The key should match the component's name property.
	 * @see {@linkcode ComponentCreateOptions}
	 */
	[key: string]: ComponentCreateOptions;
}

/**
 * Options for customizing {@linkcode SavedButtonComponent | button components} during creation. Buttons are clickable ´
 * elements that can trigger interactions or link to URLs.
 * @see {@linkcode MessageComponentCreateOptions}
 */
interface ButtonComponentCreateOptions extends MessageComponentCreateOptions {
	/**
	 * Emoji displayed on the button. Takes precedence over text labels. Can be a unicode emoji, custom emoji ID, or
	 * emoji object.
	 *
	 * **Note:** This option overrides the label option when present.
	 * @see {@linkcode ComponentEmojiResolvable}
	 */
	emoji?: ComponentEmojiResolvable;

	/** Text label displayed on the button. Ignored if emoji is provided. */
	label?: string;

	/**
	 * Visual style of the button affecting its color and behavior.
	 * @see {@linkcode ButtonStyle}
	 */
	style?: ButtonStyle;

	/**
	 * URL for link-style buttons. When provided, clicking the button navigates to this URL instead of triggering an
	 * interaction. {@linkcode style} will be automatically set to {@linkcode ButtonStyle.Link} if provided.
	 */
	url?: string;
}

/**
 * Options for customizing {@linkcode SavedChannelSelectMenuComponent | channel select menu components} during creation.
 * Channel select menus allow users to choose from available channels in a guild.
 * @see {@linkcode SelectMenuComponentCreateOptions}
 */
interface ChannelSelectMenuComponentCreateOptions extends SelectMenuComponentCreateOptions {
	/**
	 * Restricts the selectable channels to specific types. Only channels matching these types will appear in the
	 * selection menu.
	 * @see {@link ChannelType}
	 */
	channelTypes?: ChannelType[];
}

/**
 * Base options interface for all component creation. Provides a flexible structure for passing arbitrary options to
 * component factories. Specific component types extend this with their own typed properties.
 */
type ComponentCreateOptions = Record<string, any>;

/**
 * Options for customizing {@linkcode SavedMentionableSelectMenuComponent | mentionable select menu components} during
 * creation. Mentionable select menus allow selecting users, roles, or both that can be mentioned.
 * @see {@linkcode SelectMenuComponentCreateOptions}
 */
interface MentionableSelectMenuComponentCreateOptions extends SelectMenuComponentCreateOptions {}

/**
 * Options for customizing {@linkcode SavedMessageComponent | message components} during creation. Message components
 * are interactive elements attached to Discord messages.
 * @see {@linkcode ComponentCreateOptions}
 */
interface MessageComponentCreateOptions extends ComponentCreateOptions {
	/**
	 * Index for components that may be added multiple times to the same message or row. Helps generate unique custom
	 * IDs when the same component is used repeatedly.
	 */
	customIdIndex?: number;

	/**
	 * Whether the component should be disabled and non-interactive. Disabled components appear grayed out and cannot
	 * be clicked or interacted with.
	 */
	disabled?: boolean;
}

/**
 * Options for customizing {@linkcode SavedRoleSelectMenuComponent | role select menu components} during creation. Role select menus allow users to choose from available roles in a guild.
 */
interface RoleSelectMenuComponentCreateOptions extends SelectMenuComponentCreateOptions {}

/**
 * Options for customizing {@linkcode SavedSelectMenuComponent | select menu components} during creation. Select menus
 * allow users to choose one or more options from a dropdown list.
 * @see {@linkcode MessageComponentCreateOptions}
 */
interface SelectMenuComponentCreateOptions extends MessageComponentCreateOptions {
	/**
	 * Maximum number of options that can be selected simultaneously. Must be greater than or equal to minimalValues. */
	maximalValues?: number;

	/** Minimum number of options that must be selected to submit. Must be less than or equal to maximalValues. */
	minimalValues?: number;

	/** Placeholder text shown when no options are selected. Guides users on what the select menu is for. */
	placeholder?: string;
}

/**
 * Options for customizing {@linkcode SavedStringSelectMenuComponent | string select menu components} during creation.
 * String select menus present a list of text options for user selection.
 * @see {@linkcode SelectMenuComponentCreateOptions}
 */
interface StringSelectMenuComponentCreateOptions extends SelectMenuComponentCreateOptions {
	/**
	 * Array of string options to display in the select menu. Overrides any default options defined in the component
	 * template. Each string becomes a selectable option.
	 */
	options?: string[];
}

/**
 * Options for customizing {@linkcode SavedTextInputComponent | text input components} during creation. Text inputs are
 * used in modals to collect user text input.
 * @see {@linkcode ComponentCreateOptions}
 */
interface TextInputComponentCreateOptions extends ComponentCreateOptions {
	/** Label text displayed above the text input field. Describes what information should be entered. */
	label?: string;

	/** Maximum allowed length of the input text. Users cannot type beyond this limit. */
	maximalLength?: number;

	/** Minimum required length of the input text. The modal cannot be submitted if input is shorter than this. */
	minimalLength?: number;

	/** Placeholder text shown when the input field is empty. Provides example or hint text for users. */
	placeholder?: string;

	/**
	 * Whether this input field must be filled to submit the modal. Required fields prevent modal submission if empty.
	 */
	required?: boolean;

	/**
	 * Visual style of the text input affecting its appearance. Can be single-line or multi-line (paragraph) style.
	 * @see {@linkcode TextInputStyle}
	 */
	style?: TextInputStyle;

	/** Default value pre-filled in the text input. Users can modify this initial value. */
	value?: string;
}

/**
 * Options for customizing {@linkcode SavedUserSelectMenuComponent | user select menu components} during creation. User
 * select menus allow selecting Discord users from the current context.
 * @see {@linkcode SelectMenuComponentCreateOptions}
 */
interface UserSelectMenuComponentCreateOptions extends SelectMenuComponentCreateOptions {}
