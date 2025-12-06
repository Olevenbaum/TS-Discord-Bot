// Global imports
import "../../globals/notifications";
import { database } from "../../globals/variables";

// Type imports
import { Client } from "discord.js";
import { ConsoleCommand } from "../../types/others";

/** Console command to terminate the bot and exit the console */
const consoleCommand: ConsoleCommand = {
	aliases: ["END", "EXIT"],
	description: "Terminates the bot and exits the console",
	name: "QUIT",

	async execute(client: Client<true>, rlInterface) {
		await notify("INFO", "Shutting down...", client, `I'm tired and need to rest... See you! ZzZzZz...`, 5);

		await client.destroy();

		if (database) {
			await database.close();
		}

		rlInterface.close();
	},
};

export default consoleCommand;
