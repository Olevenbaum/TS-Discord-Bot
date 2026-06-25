// Data imports
import { cli } from "#application";

// External libraries imports
import { BoxRenderable, TextRenderable } from "@opentui/core";

// Module imports
import { BlankWindow, CLIView } from "#modules/cli";

/**
 * A window of the CLI responsible for showing the content for {@linkcode CLIView.OVERVIEW}.
 * @see {@linkcode BlankWindow}
 */
const window: BlankWindow = {
	description:
		"A simple overview over the most important information. A small log window can be used to see latest errors and other important messages and commands can be entered in a seperate window.",

	id: CLIView.OVERVIEW,

	menuOptions: [],

	title: "OVERVIEW",

	create: () => {
		/**
		 * Base renderable all other renderables are added to
		 * @see {@linkcode BoxRenderable}
		 */
		const base = new BoxRenderable(cli.renderer!, {});

		/**
		 * Box containing the log
		 * @see {@linkcode BoxRenderable}
		 */
		const logBox = new BoxRenderable(cli.renderer!, {});

		/**
		 * Log text the log messages are appended to
		 * @see {@linkcode TextRenderable}
		 */
		const logs = new TextRenderable(cli.renderer!, {});

		for (const log of cli.logs) {
			logs.add(log);
		}

		cli.registerLogListener((message) => {
			logs.add(message);
		});

		logBox.add(logs);
		base.add(logBox);

		return base;
	},
};

export default window;
