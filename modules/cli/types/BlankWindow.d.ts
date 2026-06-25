// External libraries imports
import { BoxRenderable, Renderable, type RenderableOptions, type SelectOption } from "@opentui/core";

// Internal module imports
import { CLIView, ConsoleHandler } from "../classes";

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
	 * Options of the context menu at the bottom.
	 * @see {@linkcode SelectOption}
	 */
	menuOptions: SelectOption[];

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
	create(handler: ConsoleHandler, options?: RenderableOptions): Renderable;

	/** Function to be exectued upon any option of the {@linkcode menuOptions} being selected. */
	onMenuSelect?: (value: boolean | number | string) => Promise<void>;
}
