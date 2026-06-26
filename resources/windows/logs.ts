// Data imports
import { cli } from "#application";

// External libraries imports
import { TextRenderable } from "@opentui/core";

// Module imports
import { type BlankWindow, ButtonRenderable, CLIView } from "#modules/cli";

/**
 * A window of the CLI responsible for showing the content for {@linkcode CLIView.LOGS}.
 * @see {@linkcode BlankWindow}
 */
const window: BlankWindow = {
	description: "Logs of the discord bot.",

	id: CLIView.LOGS,

	menuOptions: [
		new ButtonRenderable(cli.renderer!, {
			borderStyle: "rounded",

			description: "",

			name: "SAVE LOGS",

			onMouseDown: () => cli.saveLogs(),
		}),

		new ButtonRenderable(cli.renderer!, {
			borderStyle: "rounded",

			description: "",

			name: "CLEAR LOGS",

			onMouseDown: () => cli.clearLogs(),
		}),
	],
	title: "LOGS",

	create: () => {
		/**
		 * Log text the log messages are appended to
		 * @see {@linkcode TextRenderable}
		 */
		const logs = new TextRenderable(cli.renderer!, {});

		cli.logs.forEach((log) => {
			logs.add(log);
		});

		cli.registerLogListener((message) => {
			if (message) {
				logs.add(message);
			} else {
				logs.getChildren().forEach((child) => logs.remove(child.id));
			}
		});

		return logs;
	},
};

export default window;
