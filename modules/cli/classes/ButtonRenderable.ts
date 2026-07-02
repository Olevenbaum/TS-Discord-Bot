// External libraries imports
import { BoxOptions, BoxRenderable, CliRenderer, MouseEvent, RenderContext, TextRenderable } from "@opentui/core";

// Internal moudle imports
import { ButtonOptions } from "../types";

/**
 * A button that can be clicked on. A description can be shown when hovering over the button.
 * @see {@linkcode BoxRenderable}
 */
export class ButtonRenderable extends BoxRenderable {
	/** A short description that can be shown when hovering over the button. */
	public readonly description: string;

	/**
	 * Timer that shows the {@linkcode tooltip} on completion.
	 * @ee {@linkcode NodeJS.Timeout}
	 */
	protected hoverTimer: NodeJS.Timeout | undefined;

	/**
	 * The tooltip of the button showing the {@linkcode description}.
	 * @see {@linkcode BoxRenderable}
	 */
	protected readonly tooltip: BoxRenderable;

	public constructor(ctx: RenderContext, options: ButtonOptions) {
		const { description, name, ...boxOptions } = options;

		super(ctx, boxOptions as BoxOptions);

		this.description = description;
		this.focusable = true;
		this.selectable = true;

		this.add(new TextRenderable(this.ctx, { alignSelf: "center", content: name }));

		this.tooltip = new BoxRenderable(this.ctx, {
			border: true,
			borderStyle: "rounded",
			maxWidth: "30%",
			position: "absolute",
			visible: false,
			zIndex: this.zIndex + 1,
		});
		this.tooltip.add(new TextRenderable(this.ctx, { content: this.description, width: "100%", wrapMode: "word" }));

		this.onMouseOver = (event: MouseEvent) => {
			if (!this.hoverTimer) {
				this.hoverTimer = setTimeout(() => {
					if (this.ctx instanceof CliRenderer) {
						this.tooltip.x =
							event.x + this.tooltip.width + 5 <= this.ctx.root.width
								? event.x + 5
								: event.x - this.tooltip.width - 5;
						this.tooltip.y =
							event.y + this.tooltip.height <= this.ctx.root.height
								? event.y
								: event.y - this.tooltip.height;

						this.showTooltip();
					}
				}, 2000);
			}
		};

		this.onMouseOut = () => {
			if (this.hoverTimer) {
				clearTimeout(this.hoverTimer);
				this.hoverTimer = undefined;
			}

			this.hideTooltip();
		};

		if (this.ctx instanceof CliRenderer) {
			this.ctx.root.add(this.tooltip);
		}
	}

	/** Hides the {@linkcode tooltip}. */
	public hideTooltip() {
		this.tooltip.visible = false;
	}

	/** Makes the {@linkcode tooltip} visible. */
	public showTooltip() {
		this.tooltip.visible = true;
	}

	/** Toggles the visibility of the {@linkcode tooltip}. */
	public toggleTooltip() {
		this.tooltip.visible != this.tooltip.visible;
	}
}
