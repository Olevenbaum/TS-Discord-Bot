// External libraries imports
import { BoxRenderable, TextRenderable } from "@opentui/core";

// Module imports
import { type BlankWindow, ButtonRenderable, CLIView } from "#modules/cli";

/**
 * A window of the CLI responsible for showing the content for {@linkcode CLIView.LOGS}.
 * @see {@linkcode BlankWindow}
 */
const window: BlankWindow = {
	description: "Logs of the discord bot.",

	id: CLIView.LOGS,

	title: "LOGS",

	createMenuOptions: (cli) => [
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

		new ButtonRenderable(cli.renderer!, {
			borderStyle: "rounded",

			description: "",

			name: "OPEN LOGS",

			onMouseDown: () => {},
		}),
	],

	createWindow: (cli) => {
		/**
		 * Base every other renderable is added to
		 * @see {@linkcode BoxRenderable}
		 */
		const base = new BoxRenderable(cli.renderer!, {
			flexDirection: "column",
		});

		/**
		 * Log text the log messages are appended to
		 * @see {@linkcode TextRenderable}
		 */
		const currentLogs = new TextRenderable(cli.renderer!, {});

		cli.logs.forEach((log) => {
			currentLogs.add(log.content);
		});

		cli.registerLogListener((logEntry) => {
			if (logEntry) {
				currentLogs.add(logEntry.content);
			} else {
				currentLogs.clear();
				currentLogs.content = "";
			}
		});

		const oldLogs = new BoxRenderable(cli.renderer!, {
			border: ["left"],

			borderStyle: "double",
		});

		const logSelection = new BoxRenderable(cli.renderer!, {});

		const oldLogsText = new TextRenderable(cli.renderer!, {});

		oldLogs.add(logSelection);
		oldLogs.add(oldLogsText);

		base.add(currentLogs);
		base.add(oldLogs);

		return [currentLogs, logSelection];
	},
};

export default window;
