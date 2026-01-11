// Class & type imports
import type { CooldownObject } from "../../others";

// External libraries imports
import {
	type MessageActionRowComponentBuilder,
	MessageComponentInteraction,
	type MessageComponentType,
} from "discord.js";

// Internal class & type imports
import type { SavedComponent } from "./SavedComponent";
import type { MessageComponentCreateOptions } from "./CreateOptions";

/**
 * Represents a Discord message component loaded from a local file. Message components are interactive elements attached
 * to messages, such as buttons and select menus. This interface extends the base component with interaction handling.
 * @see {@linkcode SavedComponent}
 */
interface SavedMessageComponent extends SavedComponent {
	/**
	 * Cooldown configuration for the component to prevent spam or abuse. Can specify global cooldowns or per-user
	 * cooldowns with custom durations.
	 * @see {@linkcode CooldownObject}
	 */
	cooldown?: CooldownObject;

	/**
	 * The specific type of message component. Determines the component's behavior and interaction type.
	 * @see {@linkcode MessageComponentType}
	 */
	type: MessageComponentType;

	/**
	 * Creates a new instance of the message component with custom options. Allows modification of the component's
	 * appearance or behavior at creation time.
	 * @param options - Optional configuration to customize the component instance.
	 * @returns The configured message component builder with applied options.
	 * @see {@linkcode MessageComponentCreateOptions}
	 * @see {@linkcode MessageActionRowComponentBuilder}
	 */
	create(options?: MessageComponentCreateOptions): MessageActionRowComponentBuilder;

	/**
	 * Executes the component's logic when a user interacts with it. Handles the interaction and responds
	 * appropriately.
	 * @param interaction - The message component interaction to process.
	 * @see {@linkcode MessageComponentInteraction}
	 */
	execute(interaction: MessageComponentInteraction): Promise<void>;
}
