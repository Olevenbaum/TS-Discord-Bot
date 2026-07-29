// External libraries imports
import { Renderable } from "@opentui/core";

// Internal module imports
import { BlankWindow } from "./BlankWindow";
import { ButtonRenderable } from "../classes/ButtonRenderable";

/**
 * Window that can be displayed in the main area of the CLI.
 * @see {@linkcode BlankWindow}
 */
export interface Window extends Omit<BlankWindow, "createMenuOptions" | "createWindow"> {
	/**
	 * The content displayed in the window.
	 * @see {@linkcode Renderable}
	 */
	content: Renderable;

	/**
	 * The renderable to focus when the window becomes active.
	 * @see {@linkcode Renderable}
	 */
	focusTarget: Renderable;

	/**
	 * Options of the context menu at the bottom.
	 * @see {@linkcode ButtonRenderable}
	 */
	menuOptions: ButtonRenderable[];
}
