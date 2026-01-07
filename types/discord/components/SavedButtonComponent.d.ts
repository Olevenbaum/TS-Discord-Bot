// Internal type imports
import { SavedMessageComponent } from ".";
import { ButtonComponentCreateOptions } from "./CreateOptions";

// Type imports
import { ButtonBuilder, ButtonInteraction, ComponentType } from "discord.js";

/** Button component imported from local file */
interface SavedButtonComponent extends SavedMessageComponent {
	/** Type of the button message component */
	type: ComponentType.Button;

	/**
	 * Creates the button component
	 * @returns The button builder
	 */
	create(): ButtonBuilder;

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
