// External libraries imports
import { BoxOptions } from "@opentui/core";

// Intern module imports
import { ButtonGroupRenderable } from "../classes/ButtonGroupRenderable";

/**
 * Options to pass when creating a {@linkcode ButtonGroupRenderable}.
 * @see {@linkcode BoxOptions}
 */
interface ButtonGroupOptions extends BoxOptions {
	/** Whether added buttons can be selected via pressing numbers on the keyboard */
	numKeyPress?: boolean;
}
