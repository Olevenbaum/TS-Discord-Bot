// Class & type imports
import type { ActionRowCreateOptions, ComponentCreateOptions } from "../components";

/**
 * Options for customizing modal dialogs during creation. Modals are popup forms that can contain multiple components
 * arranged in action rows. These options allow configuring the modal's title and its component structure.
 */
interface ModalCreateOptions {
	/**
	 * General options applied to all components within the modal. Useful for setting common properties like disabled
	 * state across all components.
	 */
	general?: Record<string, ComponentCreateOptions>;

	/** The title text displayed at the top of the modal dialog. Should be descriptive of the modal's purpose. */
	title?: string;

	/**
	 * Component-specific options keyed by component name. Allows customizing individual components within the modal's
	 * action rows. The key should match the component's name property.
	 * @see {@linkcode ActionRowCreateOptions}
	 */
	[key: string]: ActionRowCreateOptions;
}
