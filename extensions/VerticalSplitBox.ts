// External libraries imports
import { type BoxOptions, BoxRenderable, type RenderContext, RGBA } from "@opentui/core";
import { color, type ColorInput } from "bun";

/**
 * @see {@linkcode BoxRenderable}
 */
export class VerticalSplitBoxRenderable extends BoxRenderable {
	/** All children this box contains */
	protected children: BoxRenderable[];

	/** Common options applied to all children */
	protected commonOptions: Omit<BoxOptions, "position" | "visible" | "width" | "zIndex">;

	/**
	 * @param ctx - CLI renderer
	 * @param options - Options to alter the split box
	 * @param children - Children to add to the split box
	 * @param commonOptions - Options to alter every child
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
	 * @see {@linkcode ColorInput}
	 */
	get focusColor(): ColorInput {
		return this.children[0]?.focusedBorderColor!;
	}

	/**
	 * @see {@linkcode ColorInput}
	 */
	set focusColor(focusColor: ColorInput) {
		this.children.forEach((child) => {
			child.focusedBorderColor = RGBA.fromHex(color(focusColor, "HEX")!);
		});
	}

	/**
	 * Adds multiple children to the box at a specific index or at the end
	 * @param startIndex The index after which to add the children
	 * @param children The children to add
	 * @returns The parent box for chaining
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
	 * Switches focus between children
	 * @param x The number of items to switch focus by. Defaults to `1`
	 * @param direction The direction the focus is sent. Defaults to `down`
	 * @returns The newly focused child
	 */
	switchFocus(): BoxRenderable;
	switchFocus(direction: "up" | "down"): BoxRenderable;
	switchFocus(x: number): BoxRenderable;
	switchFocus(x: number, direction: "up" | "down"): BoxRenderable;
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
