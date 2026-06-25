// Data imports
import { cli } from "#application";

// External libraries imports
import { TextRenderable } from "@opentui/core";

// Module imports
import { BlankWindow, CLIView } from "#modules/cli";

/**
 * A window of the CLI responsible for showing the content for {@linkcode CLIView.LOGS}.
 * @see {@linkcode BlankWindow}
 */
const window: BlankWindow = {
	description: "Logs of the discord bot.",

	id: CLIView.LOGS,

	menuOptions: [],

	title: "LOGS",

	create: () => {
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

		return logs;
	},
};

export default window;
