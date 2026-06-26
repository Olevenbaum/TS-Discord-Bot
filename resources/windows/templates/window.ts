// Data imports
import { cli } from "#application";

// External libraries imports
import {} from "@opentui/core";

// Module imports
import { type BlankWindow, CLIView } from "#modules/cli";

/**
 * A window of the CLI responsible for showing the content for {@linkcode CLIView}.
 * @see {@linkcode BlankWindow}
 */
const window: BlankWindow = {
	description: "",

	id: CLIView,

	menuOptions: [],

	title: "",

	create: () => {},
};

export default window;
