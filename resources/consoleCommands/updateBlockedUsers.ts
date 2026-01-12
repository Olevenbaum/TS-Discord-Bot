// Class & type imports
import { ConsoleCommand } from "../../types";

// Module imports
import updateFiles from "../../modules/update";

/** Console command to update blocked users*/
const consoleCommand: ConsoleCommand = {
	description: "Updates all global blocked users",
	name: "UPDATEBLOCKEDUSERS",

	async execute() {
		updateFiles(["blockedUsers"]);
	},
};

export default consoleCommand;
