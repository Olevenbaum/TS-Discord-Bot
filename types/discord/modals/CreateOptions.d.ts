// Type imports
import { ActionRowCreateOptions } from "../";

/** Options that can be passed when creating a modal */
interface ModalCreateOptions {
	/** General options that should be passed to all components */
	general?: Record<string, any>;

	/** The title of the modal */
	title?: string;

	/** Options that are passed to the component in the amodal whose name matches the key */
	[key: string]: ActionRowCreateOptions;
}
