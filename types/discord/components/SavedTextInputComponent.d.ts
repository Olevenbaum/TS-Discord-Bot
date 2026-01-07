// Internal type imports
import { SavedMessageComponent } from ".";
import { TextInputComponentCreateOptions } from "./CreateOptions";

// Type imports
import { ComponentType, TextInputBuilder } from "discord.js";

/** Text input component imported from local file */
interface SavedTextInputComponent extends SavedModalComponent {
	/** Type of the text input component */
	type: ComponentType.TextInput;

	/**
	 * Creates the text input component
	 * @returns The text input component builder
	 */
	create(): TextInputBuilder;

	/**
	 * Creates the text input component
	 * @param options The options to modify the text input component
	 * @returns The text input component builder
	 */
	create(options?: TextInputComponentCreateOptions): TextInputBuilder;
}
