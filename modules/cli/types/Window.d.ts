// External libraries imports
import { Renderable } from "@opentui/core";

// Internal module imports
import { BlankWindow } from "./BlankWindow";

/**
 * Window that can be displayed in the main area of the CLI.
 * @see {@linkcode BlankWindow}
 */
export interface Window extends BlankWindow {
	/**
	 * The content displayed in the window.
	 * @see {@linkcode Renderable}
	 */
	content: Renderable;
}
