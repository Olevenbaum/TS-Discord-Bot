// Internal type imports
import { SavedComponent } from ".";
import { MessageComponentCreateOptions } from "../CreateOptions";

// Type imports
import { MessageActionRowComponentBuilder, MessageComponentInteraction, MessageComponentType } from "discord.js";
import { CooldownObject } from "../../others";

/** Message component imported from local file */
interface SavedMessageComponent extends SavedComponent {
	/** The time any or a specific user has to wait to use this message component again */
	cooldown?: CooldownObject;

	/** Type of the message component */
	type: MessageComponentType;

	/**
	 * Creates the message component
	 * @returns The message component builder
	 */
	create(): MessageActionRowComponentBuilder;

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
