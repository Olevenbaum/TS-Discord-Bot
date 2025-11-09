// Type imports
import { ConsoleCommand } from "../../../types/others";

/** Template for console command */
const consoleCommand: ConsoleCommand = {
	description: "",
	name: "",

	async execute(client, rlInterface, ...parameters) {},
};

export default consoleCommand;
