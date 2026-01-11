// External libraries imports
import { ButtonBuilder, ButtonInteraction, ComponentType } from "discord.js";

// Internal class & type imports
import type { SavedMessageComponent } from "./SavedMessageComponent";
import type { ButtonComponentCreateOptions } from "./CreateOptions";

/**
 * Represents a Discord button component loaded from a local file. Buttons are clickable elements that can trigger
 * interactions or link to URLs, providing interactive UI elements in messages.
 * @see {@linkcode SavedMessageComponent}
 */
interface SavedButtonComponent extends SavedMessageComponent {
	/**
	 * The component type, fixed to {@linkcode ComponentType.Button} for button components.
	 * @see {@linkcode ComponentType.Button}
	 */
	type: ComponentType.Button;

	/**
	 * Creates a new instance of the button component with custom options. Allows modification of the button's
	 * appearance or behavior at creation time.
	 * @param options - Optional configuration to customize the button instance.
	 * @returns The configured button builder with applied options.
	 * @override
	 * @see {@linkcode ButtonBuilder}
	 * @see {@linkcode ButtonComponentCreateOptions}
	 */
	create(options?: ButtonComponentCreateOptions): ButtonBuilder;

	/**
	 * Executes the button's logic when a user interacts with it. Handles the interaction and responds
	 * appropriately.
	 * @param interaction - The button interaction to process.
	 * @override
	 * @see {@linkcode ButtonInteraction}
	 */
	execute(interaction: ButtonInteraction): Promise<void>;
}
