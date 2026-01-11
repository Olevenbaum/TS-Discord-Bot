// External libraries imports
import { ComponentType, TextInputBuilder } from "discord.js";

// Internal class & type imports
import type { SavedModalComponent } from "./SavedModalComponent";
import type { TextInputComponentCreateOptions } from "./CreateOptions";

/**
 * Represents a Discord text input component loaded from a local file. Text inputs are form fields used in modal
 * dialogs to collect text input from users. They extend modal components with text-specific creation capabilities.
 * @see {@linkcode SavedModalComponent}
 */
interface SavedTextInputComponent extends SavedModalComponent {
	/**
	 * The component type, fixed to {@linkcode ComponentType.TextInput} for text input components.
	 * @see {@linkcode ComponentType.TextInput}
	 */
	type: ComponentType.TextInput;

	/**
	 * Creates a new instance of the text input component with custom options. Allows modification of the text input's
	 * appearance or behavior at creation time.
	 * @param options - Optional configuration to customize the text input instance.
	 * @returns The configured text input builder with applied options.
	 * @override
	 * @see {@linkcode TextInputBuilder}
	 * @see {@linkcode TextInputComponentCreateOptions}
	 */
	create(options?: TextInputComponentCreateOptions): TextInputBuilder;
}
