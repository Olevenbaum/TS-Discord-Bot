// External libraries imports
import { BoxRenderable, Renderable, type RenderableOptions } from "@opentui/core";

// Internal module imports
import { ButtonRenderable, CLIView, ConsoleHandler } from "../classes";

/** Window that can be displayed in the main area of the CLI. */
export interface BlankWindow {
	/**
	 * ID of the window. For registration and access purposes only.
	 * @see {@linkcode CLIView}
	 */
	id: CLIView;

	/** Description of the windows content. */
	description: string;

	/**
	 * Creates the options of the context menu at the bottom.
	 * @param handler The console handler all buttons are registered to.
	 * @returns A list of buttons for the context menu.
	 * @see {@linkcode ButtonRenderable}
	 */
	createMenuOptions: (handler: ConsoleHandler<true>) => ButtonRenderable[];

	/** Title of the window. Displayed at the top and in the menu. */
	title: string;

	/**
	 * Creates the renderable to be added to the renderer.
	 * @param handler The console handler this window is registered to.
	 * @param options Defaults to an empty object.
	 * @returns The renderable to be shown in the main CLI area.
	 * @see {@linkcode ConsoleHandler}
	 * @see {@linkcode Renderable}
	 * @see {@linkcode RenderableOptions}
	 */
	create(handler: ConsoleHandler<true>, options?: RenderableOptions): Renderable;
}
