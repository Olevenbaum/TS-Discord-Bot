// Global imports
import "../../globals/fileUpdate";

// Type imports
import { ConsoleCommand } from "../../types/others";

/** Console command to update blocked users*/
const consoleCommand: ConsoleCommand = {
	description: "Updates all global blocked users",
	name: "UPDATEBLOCKEDUSERS",

	async execute() {
		updateFiles(undefined, ["blockedUsers"]);
	},
};

export default consoleCommand;
