// Class & type imports
import { ConsoleCommand } from "../../types";

// Data imports
import { cli, client } from "#application";

// Module imports
import notify from "../../modules/notification";

/** Console command to terminate the bot and exit the console */
const consoleCommand: ConsoleCommand = {
	aliases: ["END", "EXIT"],
	description: "Terminates the bot and exits the console",
	name: "QUIT",

	async execute() {
		await notify("Shutting down...", "INFORMATION", `I'm tired and need to rest... See you! ZzZzZz...`, 6);

		await client.destroy();

		cli.saveLogs();
		cli.destroy();
	},
};

export default consoleCommand;
