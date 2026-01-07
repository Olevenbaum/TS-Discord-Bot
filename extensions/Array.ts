declare global {
	interface Array<T> {
		/**
		 * Asynchronously finds the first element in the array that satisfies the provided testing function
		 * @param predicate - A function to execute on each value in the array until the function returns true,
		 * indicating that the first element satisfying the predicate was found
		 * @returns The value of the first element in the array that satisfies the provided testing function or
		 * undefined if no element satisfies
		 */
		asyncFind(predicate: (element: T, key: number, array: T[]) => Promise<boolean>): Promise<T | undefined>;

		/**
		 * Asynchronously finds the first element in the array that satisfies the provided testing function
		 * @param predicate - A function to execute on each value in the array until the function returns true,
		 * indicating that the first element satisfying the predicate was found
		 * @param thisArg - An object to which the this keyword can refer in the predicate function
		 * @returns The value of the first element in the array that satisfies the provided testing function or
		 * undefined if no element satisfies
		 */
		asyncFind(
			predicate: (element: T, key: number, array: T[]) => Promise<boolean>,
			thisArg: T[],
		): Promise<T | undefined>;

		/**
		 * Shifts the elements in the array up by one position. The first element is appended to the end.
		 * @returns The shifted array
		 * @throws {@linkcode TypeError}
		 */
		rotate(): T[];

		/**
		 * Shifts the elements in the array up by a specified number of positions. Elements removed from the start are
		 * appended to the end. A number higher than the array shifts by the number modulo the array length.
		 * @param count - The number to shift the array elements by
		 * @returns The shifted array
		 * @throws {@linkcode TypeError}
		 */
		rotate(count: number): T[];

		/**
		 * Shifts the elements in the array up or down by one position. The element that would leave the array due to
		 * the shifting process is appended or prepended to the other end.
		 * @param reverse - Whether to shift the array up or down
		 * @returns The shifted array
		 * @throws {@linkcode TypeError}
		 */
		rotate(reverse: boolean): T[];

		/**
		 * Shifts the elements in the array up or down by a specified number of positions. Elements that would leave
		 * the array due to the shifting process are appended or prepended to the other end. A number higher than the
		 * array shifts by the number modulo the array length.
		 * @param count - The number to shift the array elements by
		 * @param reverse - Whether to shift the array up or down
		 * @returns The shifted array
		 * @throws {@linkcode TypeError}
		 */
		rotate(count: number, reverse: boolean): T[];
	}
}

if (!Array.prototype.asyncFind) {
	Array.prototype.asyncFind = async function <T>(
		predicate: (element: T, key: number, array: T[]) => Promise<boolean>,
		thisArg?: T[],
	): Promise<T | undefined> {
		/** Predicate with replaced "this" object */
		const boundPredicate = predicate.bind(thisArg);

		for (const index of this.keys()) {
			const element = this[index] as T;

			if (await boundPredicate(element, index, this)) {
				return element;
			}
		}

		return undefined;
	};
}

if (!Array.prototype.rotate) {
	Array.prototype.rotate = function (count: number | boolean = 1, reverse: boolean = false) {
		reverse = typeof count === "boolean" ? count : reverse;
		count = typeof count === "boolean" ? 1 : count;

		if (count < 0) {
			throw TypeError("Parameter 'count' must be a positive number");
		}

		if (count === 0) {
			return this;
		}

		count = Math.floor(count);
		count %= this.length;

		if (reverse) {
			this.push(...this.splice(0, this.length - count));
		} else {
			this.unshift(...this.splice(count, this.length));
		}

		return this;
	};
}

export {};
