// Global imports
import "../../globals/fileUpdate";

// Type imports
import { ConsoleCommand } from "../../types/others";

/** Console command to update the configuration data */
const consoleCommand: ConsoleCommand = {
	aliases: ["UPDATECONFIGURATION"],
	description: "Updates the configuration data",
	name: "UPDATECONFIGURATIONDATA",

	async execute() {
		updateFiles(undefined, ["configuration"]);
	},
};

export default consoleCommand;
