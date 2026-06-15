// Class & type imports
import { CLIView } from "#classes";

// Data imports
import { cli } from "#application";

// External libraries imports
import { BoxRenderable } from "@opentui/core";

// Module imports
import { BlankWindow } from "#modules/cli";

export const window: BlankWindow = {
	create: () => {
		return new BoxRenderable(cli.renderer!, {});
	},
	description:
		"A simple overview over the most important information. A small log window can be used to see latest errors and other important messages and commands can be entered in a seperate window.",
	id: CLIView.OVERVIEW,
	menuOptions: [],
	title: "OVERVIEW",
};
