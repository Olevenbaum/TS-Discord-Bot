// External libraries imports
import { BoxRenderable, KeyEvent, MouseEvent, type RenderContext } from "@opentui/core";

// Internal module imports
import { ButtonRenderable } from "./ButtonRenderable";
import type { ButtonGroupOptions } from "../types/ButtonGroupOptions";

/**
 * An extended {@linkcode BoxRenderable} containing {@linkcode ButtonRenderable | ButtonRenderables}.
 * @see {@linkcode BoxRenderable}
 */
export class ButtonGroupRenderable extends BoxRenderable {
	/**
	 * List of all added {@linkcode ButtonRenderable | ButtonRenderables}
	 * @see {@linkcode BoxRenderable}
	 */
	protected buttons: ButtonRenderable[] = [];

	public constructor(ctx: RenderContext, options: ButtonGroupOptions) {
		super(ctx, options);

		if (options.numKeyPress) {
			this.onKeyDown = (key: KeyEvent) => {
				if (key.number && Number(key.name) < this.buttons.length) {
					/**
					 * {@linkcode ButtonRenderable | Button} that should be interacted with
					 * @see {@linkcode ButtonRenderable}
					 */
					const button = this.buttons[Number(key.name) - 1]!;

					if (key.ctrl) {
						if (key.eventType === "press") {
							button.showTooltip();
						} else if (key.eventType === "release") {
							button.hideTooltip();
						}
					} else {
						button.processMouseEvent(
							new MouseEvent(button, {
								button: 0,
								isDragging: false,
								modifiers: { alt: false, ctrl: false, shift: false },
								source: this,
								type: "down",
								x: button.x + button.width / 2,
								y: button.y + button.height / 2,
							}),
						);
					}
				}
			};
		}
	}

	public override add(button: ButtonRenderable, index?: number): number {
		this.buttons.push(button);

		return super.add(button, index);
	}

	public override remove(id: string) {
		this.buttons.splice(
			this.buttons.findIndex((button) => button.id === id),
			1,
		);

		super.remove(id);
	}
}
