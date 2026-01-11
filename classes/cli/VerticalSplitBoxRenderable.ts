// External libraries imports
import { type BoxOptions, BoxRenderable, type RenderContext, RGBA } from "@opentui/core";
import { color, type ColorInput } from "bun";

/**
 * A renderable component that arranges child BoxRenderable elements vertically in a column layout. Provides focus
 * management and common styling options for all children. Extends BoxRenderable with vertical flex direction and tab
 * based navigation between children.
 * @see {@linkcode BoxRenderable}
 */
export class VerticalSplitBoxRenderable extends BoxRenderable {
	/** All children BoxRenderable elements contained within this vertical split box */
	protected children: BoxRenderable[];

	/** Common styling options applied to all child elements */
	protected commonOptions: Exclude<BoxOptions, "position" | "visible" | "width" | "zIndex">;

	/**
	 * Creates a new VerticalSplitBoxRenderable instance for arranging child elements vertically.
	 * @param ctx - The CLI renderer context used for rendering the component.
	 * @param options - Options to customize the split box appearance and behavior.
	 * @param children - Initial child BoxRenderable elements to add to the split box.
	 * @param commonOptions - Styling options to apply to all child elements.
	 */
	constructor(
		ctx: RenderContext,
		options?: BoxOptions,
		children: BoxRenderable[] = [],
		commonOptions: Omit<BoxOptions, "position" | "visible" | "width" | "zIndex"> = {},
	) {
		super(ctx, { ...options, flexDirection: "column" });

		this.children = children;
		this.commonOptions = commonOptions;

		this.children.forEach((child) => {
			this.add(child);

			Object.entries(this.commonOptions).forEach(([key, value]) => {
				(child as any)[key] = value;
			});
		});

		this.onKeyDown = (key) => {
			if (key.name === "tab") {
				this.switchFocus();
			}
		};
	}

	/**
	 * Gets the focus color of the first child element. This represents the focused border color used when a child is
	 * active.
	 * @returns The focus color of the first child element.
	 * @see {@linkcode ColorInput}
	 */
	get focusColor(): ColorInput {
		return this.children[0]?.focusedBorderColor!;
	}

	/**
	 * Sets the focus color for all child elements. Updates the focused border color for every child.
	 * @param focusColor - The new focus color to apply to all children.
	 * @see {@linkcode ColorInput}
	 */
	set focusColor(focusColor: ColorInput) {
		this.children.forEach((child) => {
			child.focusedBorderColor = RGBA.fromHex(color(focusColor, "HEX")!);
		});
	}

	/**
	 * Adds multiple children to the vertical split box at a specific index or at the end. Applies common styling
	 * options to each new child and updates the internal children array.
	 * @param startIndex - The index after which to add the children, or the first child if not a number.
	 * @param children - The child BoxRenderable elements to add.
	 * @returns The parent box instance for method chaining.
	 */
	addChildren(...children: BoxRenderable[]): VerticalSplitBoxRenderable;
	addChildren(startIndex: number, ...children: BoxRenderable[]): VerticalSplitBoxRenderable;
	addChildren(startIndex: number | BoxRenderable, ...children: BoxRenderable[]): VerticalSplitBoxRenderable {
		if (typeof startIndex !== "number") {
			children.unshift(startIndex);
		}

		children.forEach((child, index) => {
			this.add(child);

			Object.entries(this.commonOptions).forEach(([key, value]) => {
				(child as any)[key] = value;
			});

			if (typeof startIndex === "number") {
				this.children.splice(startIndex + index, 0, child);
			} else {
				this.children.push(child);
			}

			this.children.push(child);
		});

		return this;
	}

	/**
	 * Switches focus between child elements in the vertical split box. Supports moving focus by a specified number of
	 * positions in either direction. If no child is currently focused, focuses the first child.
	 * @param x - The number of positions to move focus by, or the direction string. Defaults to `1`.
	 * @param direction - The direction to move focus (`"up"` or `"down"`). Defaults to `"down"`.
	 * @returns The newly focused child element.
	 */
	switchFocus(direction?: "up" | "down"): BoxRenderable;
	switchFocus(x?: number, direction?: "up" | "down"): BoxRenderable;
	switchFocus(x: number | "up" | "down" = 1, direction: "up" | "down" = "down"): BoxRenderable {
		/** Index of the currently focused child */
		const focusedIndex = this.children.findIndex((child) => child.focused);

		if (typeof x === "string") {
			direction = x;
			x = 1;
		}

		if (focusedIndex !== -1) {
			this.children[focusedIndex]!.blur();
			this.children[(focusedIndex + (direction === "up" ? -x : x)) % this.children.length]!.focus();

			return this.children[(focusedIndex + (direction === "up" ? -x : x)) % this.children.length]!;
		}

		this.children[0]!.focus();

		return this.children[0]!;
	}
}
