// Class & type imports
import type { ConsoleCommand } from "../../types";

// External libraries imports
import {
	type BoxOptions,
	BoxRenderable,
	InputRenderable,
	InputRenderableEvents,
	KeyEvent,
	MouseEvent,
	Renderable,
	RenderableEvents,
	type RenderContext,
	type SelectOption,
	SelectRenderable,
	SelectRenderableEvents,
} from "@opentui/core";

// Internal class & tpe imports
import { CommandHandler } from "./CommandHandler";
import { ConsoleHandler } from "./ConsoleHandler";

/**
 * A renderable component that provides an interactive command-line interface for executing console commands. It
 * combines an input field for command entry with an autocomplete dropdown for command suggestions. This class handles
 * command parsing, parameter validation, and execution, integrating with the bot's console system.
 * @see {@linkcode BoxRenderable}
 */
export class CommandInputRenderable extends BoxRenderable {
	/**
	 * Collection of available console commands loaded from the file system. These commands can be executed through the
	 * command input interface.
	 * @see {@linkcode ConsoleCommand}
	 */
	protected _commands: ConsoleCommand[] = [];

	/**
	 * The autocomplete dropdown that displays command suggestions based on user input. Shows matching commands and
	 * aliases as the user types.
	 * @see {@linkcode SelectRenderable}
	 */
	protected autocompleteInput?: SelectRenderable;

	/**
	 * @see {@linkcode CommandHandler}
	 */
	protected commandHandler: CommandHandler;

	/**
	 * The input field where users enter console commands. Handles text input and command submission via Enter key.
	 * @see {@linkcode InputRenderable}
	 */
	protected commandInput?: InputRenderable;

	/**
	 * Creates a new command input renderable with the specified rendering context and options. Initializes the input
	 * field and autocomplete dropdown, sets up event handlers for command execution and autocomplete suggestions.
	 * @param parent - The parent this renderable was added to or the base CLI renderer.
	 * @param options - Optional configuration options for the box container.
	 * @see {@linkcode BoxOptions}
	 * @see {@linkcode Renderable}
	 * @see {@linkcode RenderContext}
	 */
	constructor(parent: Renderable | RenderContext, options: BoxOptions = {}) {
		super(parent instanceof Renderable ? parent.ctx : parent, options);

		this.commandHandler = new CommandHandler();

		if (parent instanceof Renderable) {
			this.parent = parent;
		}

		this.commandInput = new InputRenderable(
			this.parent instanceof Renderable ? this.parent.ctx : (parent as RenderContext),
			{
				placeholder: "Enter command...",
				width: "60%",
			},
		)
			.on(InputRenderableEvents.ENTER, (input: string) => {
				try {
					this.commandHandler.handleCommand(input);
					this.commandInput!.value = "";
				} catch (error) {
					if (this.parent instanceof ConsoleHandler) {
						this.parent.error(error);
					}
				}
			})
			.on(InputRenderableEvents.INPUT, (input: string) => {
				/**
				 * Options the user might choose from
				 * @see {@linkcode SelectOption}
				 */
				const options: SelectOption[] = [];

				if (input.includes(" ")) {
					const transformedInput = this.commandHandler.handleInput(input);

					if (Array.isArray(transformedInput)) {
						const [command] = transformedInput;
						if (command.parameters) {
						}
					}
				} else {
					this.commands.forEach((command) => {
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

				this.autocompleteInput!.options = options;
			});

		this.autocompleteInput = new SelectRenderable(
			this.parent instanceof Renderable ? this.parent.ctx : (parent as RenderContext),
			{
				keyBindings: [
					{ name: "up", action: "move-up" },
					{ name: "down", action: "move-down" },
				],
				minWidth: 40,
				width: "40%",
			},
		).on(SelectRenderableEvents.ITEM_SELECTED, (_: number, option: SelectOption) => {
			this.commandInput!.insertText((option.value ?? option.name).substring(this.commandInput!.value.length));
		});

		this.on(RenderableEvents.FOCUSED, () => this.commandInput!.focus());

		this.autocompleteInput.options = this._commands
			.map((command) => {
				/**
				 * Options of the autocomplete input based on every console command
				 * @see {@linkcode SelectOption}
				 */
				const options: SelectOption[] = [];

				options.push({
					name: command.name,
					description: command.description,
				});

				if (command.aliases) {
					command.aliases.forEach((alias) => {
						options.push({
							name: alias,
							description: command.description,
						});
					});
				}

				return options;
			})
			.flat();

		this.add(this.commandInput);
		this.add(this.autocompleteInput);

		this.onMouseScroll = (event: MouseEvent) => {
			if (event.scroll!.direction === "up") {
				this.autocompleteInput!.moveUp();
			} else if (event.scroll!.direction === "down") {
				this.autocompleteInput!.moveDown();
			}
		};

		this.onKeyDown = (key: KeyEvent) => {
			if (key.name === "tab") {
				this.autocompleteInput!.selectCurrent();
			} else if (key.name === "up") {
				this.autocompleteInput!.moveUp();
			} else if (key.name === "down") {
				this.autocompleteInput!.moveDown();
			}

			if (this.parent instanceof ConsoleHandler) {
				this.parent.debug(key.name);
			}
		};
	}

	/**
	 * Gets the current list of loaded console commands.
	 * @returns An array of available console commands.
	 * @see {@linkcode ConsoleCommand}
	 */
	public get commands(): ConsoleCommand[] {
		return this.commandHandler.commands;
	}

	/**
	 * Reloads the console commands from the file system. Updates the internal command list with the latest commands
	 * available in the configured console commands directory.
	 */
	public async updateCommands(): Promise<void> {
		this.commandHandler.updateCommands();
	}
}
