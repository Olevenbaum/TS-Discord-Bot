// Data imports
import { cli } from "#application";

// External libraries imports
import {
	BoxRenderable,
	InputRenderable,
	InputRenderableEvents,
	type SelectOption,
	SelectRenderable,
	SelectRenderableEvents,
} from "@opentui/core";

// Module imports
import { type BlankWindow, CLIView } from "#modules/cli";

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
		const base = new BoxRenderable(cli.renderer!, { flexDirection: "row", height: "100%" });

		/**
		 * Box containing the command input
		 * @see {@linkcode BoxRenderable}
		 */
		const commandInputBox = new BoxRenderable(cli.renderer!, {
			border: ["right"],
			height: "100%",
			width: "50%",
		});

		/**
		 * Box containing the command selection
		 * @see {@linkcode BoxRenderable}
		 */
		const commandSelectBox = new BoxRenderable(cli.renderer!, {
			border: ["left"],
			height: "100%",
			width: "50%",
		});

		/**
		 * Input renderable to enter console commands in. Can be autocompleted using the select renderable.
		 * @see {@linkcode InputRenderable}
		 */
		const commandInput = new InputRenderable(cli.renderer!, {
			placeholder: "Enter command...",
		});

		const commandSelect = new SelectRenderable(cli.renderer!, {
			options: cli.suggestCommand(),
		});

		commandInputBox.add(commandInput);
		commandSelectBox.add(commandSelect);

		commandInput.on(InputRenderableEvents.INPUT, (input: string) => {
			commandSelect.options = cli.suggestCommand(input);
		});

		commandInput.on(InputRenderableEvents.ENTER, (input: string) => {
			/** Command that was entered */
			const command = cli.findCommand(input);

			if (command) {
				try {
					cli.findCommand(input)?.execute();
					commandInput.value = "";
				} catch (error) {
					cli.error(error);
				}
			} else {
				cli.warn(`Unknown command '${input}' entered in console`);
			}
		});

		commandSelect.on(SelectRenderableEvents.ITEM_SELECTED, (_: number, option: SelectOption) => {
			commandInput.insertText((option.value as string).substring(commandInput.value.length));
		});

		base.add(commandInputBox);
		base.add(commandSelectBox);

		return base;
	}
};

export default window;
