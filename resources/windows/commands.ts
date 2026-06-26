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
		const base = new BoxRenderable(cli.renderer!, { flexDirection: "row" });

		/**
		 * Input renderable to enter console commands in. Can be autocompleted using the select renderable.
		 * @see {@linkcode InputRenderable}
		 */
		const commandInput = new InputRenderable(cli.renderer!, {
			placeholder: "Enter command...",
		});

		const commandSelect = new SelectRenderable(cli.renderer!, {
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

		commandInput.on(InputRenderableEvents.CHANGE, (input: string) => {
			/**
			 * Options the user might choose from
			 * @see {@linkcode SelectOption}
			 */
			const options: SelectOption[] = [];

			if (input.includes(" ")) {
				const transformedInput = cli.handleInput(input);

				if (Array.isArray(transformedInput)) {
					const [command] = transformedInput;
					if (command.parameters) {
					}
				}
			} else {
				cli.commands!.forEach((command) => {
					if (command.name.startsWith(input.toUpperCase())) {
						options.push({
							name: command.name,
							description: command.description,
						});
					}

					if (command.aliases) {
						command.aliases.forEach((alias) => {
							if (alias.startsWith(input.toUpperCase())) {
								options.push({
									name: alias,
									description: command.description,
								});
							}
						});
					}
				});
			}

			commandSelect.options = options;
		});

		commandInput.on(InputRenderableEvents.ENTER, (input: string) => {
			try {
				cli.handleCommand(input);
				commandInput.value = "";
			} catch (error) {
				cli.error(error);
			}
		});

		commandSelect.on(SelectRenderableEvents.ITEM_SELECTED, (_: number, option: SelectOption) => {
			commandInput.insertText((option.value ?? option.name).substring(commandInput.value.length));
		});

		base.add(commandInput);
		base.add(commandSelect);

		return base;
	},
};

export default window;
