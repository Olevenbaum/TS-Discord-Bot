// Data imports
import { cli } from "#application";

// External libraries imports
import { BoxRenderable, SelectRenderable } from "@opentui/core";

// Module imports
import { BlankWindow, CLIView } from "#modules/cli";

/**
 * A window of the CLI responsible for showing the content for {@linkcode CLIView.COMMANDS}.
 * @see {@linkcode BlankWindow}
 */
const window: BlankWindow = {
	description: "A window to enter various commands interacting with the bot.",

	id: CLIView.COMMANDS,

	menuOptions: [],

	title: "COMMANDS",

	create: () => {
		/**
		 * Base renderable all other renderables are added to
		 * @see {@linkcode BoxRenderable}
		 */
		const base = new BoxRenderable(cli.renderer!, {});

		return new SelectRenderable(cli.renderer!, {
			flexDirection: "row",
			options: cli
				.commands!.map((command) => {
					return [
						{ description: command.description, name: command.name, value: command.name },
						...(command.aliases?.map((alias) => {
							return { description: command.description, name: alias, value: command.name };
						}) ?? []),
					];
				})
				.flat(),
		});
	},
};

export default window;
