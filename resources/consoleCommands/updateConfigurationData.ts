// Class & type imports
import { ConsoleCommand } from "../../types";

// Module imports
import updateFiles from "../../modules/update";

/** Console command to update the configuration data */
const consoleCommand: ConsoleCommand = {
	aliases: ["UPDATECONFIGURATION"],
	description: "Updates the configuration data",
	name: "UPDATECONFIGURATIONDATA",

	async execute() {
		updateFiles(["configuration"]);
	},
};

export default consoleCommand;
