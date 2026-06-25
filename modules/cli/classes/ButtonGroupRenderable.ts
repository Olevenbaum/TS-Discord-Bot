// External libraries imports
import { BoxRenderable } from "@opentui/core";

// Internal module imports
import { ButtonRenderable } from "./ButtonRenderable";

/**
 * An extended {@linkcode BoxRenderable} containing {@linkcode ButtonRenderable | ButtonRenderables}.
 * @see {@linkcode BoxRenderable}
 */
export class ButtonGroupRenderable extends BoxRenderable {
	public override add(button: ButtonRenderable, index?: number): number {
		return super.add(button, index);
	}
}
