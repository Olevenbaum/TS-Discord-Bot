// External libraries imports
import { BorderStyle, BoxOptions, MouseEvent } from "@opentui/core";

// Internal module imports
import { ButtonRenderable } from "../classes";

/**
 * Options to pass when creating a {@linkcode ButtonRenderable}.
 * @see {@linkcode BoxOptions}
 */
export interface ButtonOptions extends Omit<BoxOptions<ButtonRenderable>, "focusable"> {
	/** Description of the button and its use. */
	description: string;

	borderStyle: BorderStyle;

	/** Name to be shown in the center of the button. */
	name: string;

	onMouseDown: (this: ButtonRenderable, event: MouseEvent) => void;
}
