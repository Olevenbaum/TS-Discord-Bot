// External library imports
import { type BoxOptions, BoxRenderable, Renderable, type RenderContext, RGBA } from "@opentui/core";
import { color, type ColorInput } from "bun";

/**
 * A renderable component that arranges child BoxRenderable elements vertically in a column layout. Provides focus
 * management and common styling options for all children. Extends BoxRenderable with vertical flex direction and tab
 * based navigation between children.
 * @see {@linkcode BoxRenderable}
 */
export class VerticalSplitBoxRenderable extends BoxRenderable {
	/**
	 * All children BoxRenderable elements contained within this vertical split box
	 * @ee {@linkcode BoxRenderable}
	 */
	protected children: BoxRenderable[];

	/**
	 * Common styling options applied to all child elements
	 * @see {@linkcode BoxOptions}
	 */
	protected commonOptions: Exclude<BoxOptions, "position" | "visible" | "width" | "zIndex">;

	/**
	 * Creates a new VerticalSplitBoxRenderable instance for arranging child elements vertically.
	 * @param parent - The parent this renderable was added to or the base CLI renderer.
	 * @param options - Options to customize the split box appearance and behavior.
	 * @param children - Initial child BoxRenderable elements to add to the split box.
	 * @param commonOptions - Styling options to apply to all child elements.
	 */
	constructor(
		parent: Renderable | RenderContext,
		options?: BoxOptions,
		children: BoxRenderable[] = [],
		commonOptions: Exclude<BoxOptions, "position" | "visible" | "width" | "zIndex"> = {},
	) {
		super(parent instanceof Renderable ? parent.ctx : parent, { ...options, flexDirection: "column" });

		if (parent instanceof Renderable) {
			this.parent = parent;
		}

		this.children = children;
		this.commonOptions = commonOptions;

		this.children.forEach((child) => {
			Object.assign(child, this.commonOptions);

			child.onMouseOver = () => {
				child.focus();
			};

			child.onMouseOut = () => {
				child.blur();
			};

			this.add(child);
		});
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
	 * Adds multiple children to the vertical split box at the end. Applies common styling options to each new child
	 * and updates the internal children array.
	 * @param children - The child BoxRenderable elements to add.
	 * @returns The parent box instance for method chaining.
	 * @see {@linkcode BoxRenderable}
	 * @see {@linkcode VerticalSplitBoxRenderable}
	 */
	addChildren(...children: BoxRenderable[]): VerticalSplitBoxRenderable;

	/**
	 * Adds multiple children to the vertical split box at a specific index. Applies common styling options to each new
	 * child and updates the internal children array.
	 * @param startIndex - The index after which to add the children, or the first child if not a number.
	 * @param children - The child BoxRenderable elements to add.
	 * @returns The parent box instance for method chaining.
	 * @see {@linkcode BoxRenderable}
	 * @see {@linkcode VerticalSplitBoxRenderable}
	 */
	addChildren(startIndex: number, ...children: BoxRenderable[]): VerticalSplitBoxRenderable;

	addChildren(startIndex: number | BoxRenderable, ...children: BoxRenderable[]): VerticalSplitBoxRenderable {
		if (typeof startIndex !== "number") {
			children.unshift(startIndex);
		}

		children.forEach((child, index) => {
			Object.assign(child, this.commonOptions);

			if (typeof startIndex === "number") {
				this.children.splice(startIndex + index, 0, child);
			} else {
				this.children.push(child);
			}

			child.onMouseOver = () => {
				child.focus();
			};

			child.onMouseOut = () => {
				child.blur();
			};

			this.add(child, typeof startIndex === "number" ? startIndex + index : undefined);
		});

		return this;
	}

	/**
	 * Switches focus between child elements in the vertical split box. Supports moving focus by a specified number of
	 * positions in either direction. If no child is currently focused, focuses the first child.
	 * @param x - The number of positions to move focus by, or the direction string. Defaults to `1`.
	 * @param direction - The direction to move focus (`"up"` or `"down"`). Defaults to `"down"`.
	 * @returns The newly focused child element if existent.
	 */
	switchFocus(direction?: "up" | "down"): BoxRenderable | undefined;
	switchFocus(x?: number, direction?: "up" | "down"): BoxRenderable | undefined;
	switchFocus(x: number | "up" | "down" = 1, direction: "up" | "down" = "down"): BoxRenderable | undefined {
		/** Index of the currently focused child */
		const focusedIndex = this.children.findIndex((child) => child.focused);

		if (typeof x === "string") {
			direction = x;
			x = 1;
		}

		if (focusedIndex !== -1) {
			this.children[focusedIndex]?.blur();
			this.children[(focusedIndex + (direction === "up" ? -x : x)) % this.children.length]?.focus();

			return this.children[(focusedIndex + (direction === "up" ? -x : x)) % this.children.length]!;
		}

		this.children[0]?.focus();

		return this.children[0];
	}
}
