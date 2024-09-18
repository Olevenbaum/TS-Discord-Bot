declare global {
    interface Array<T> {
        /**
         * Asynchronously finds the first element in the array that satisfies the provided testing function
         * @param predicate A function to execute on each value in the array until the function returns true,
         * indicating that the first element satisfying the predicate was found
         * @param thisArg An object to which the this keyword can refer in the predicate function
         * @returns The value of the first element in the array that satisfies the provided testing function or
         * undefined if no element satisfies
         */
        asyncFind(
            predicate: (element: T, key: number, array: T[]) => Promise<boolean>,
            thisArg?: T[]
        ): Promise<T | undefined>;

        /**
         * Shifts the elements in the array
         * @param count The number to shift the array elements by
         * @param reverse Whether to shift the array elements in the opposite direction
         * @returns The shifted array
         */
        rotate(count?: number, reverse?: boolean): T[];
    }
}

// Check if method is already defined
if (!Array.prototype.asyncFind) {
    Array.prototype.asyncFind = async function <T>(
        predicate: (element: T, key: number, array: T[]) => Promise<boolean>,
        thisArg?: T[]
    ): Promise<T | undefined> {
        /**
         * Predicate with replaced "this" object
         */
        const boundPredicate = predicate.bind(thisArg);

        // Iterate over keys of array
        for (const key of this.keys()) {
            // Check if callback function returns true for element
            if (await boundPredicate(this[key], key, this)) {
                // Return element
                return this[key];
            }
        }

        // Return undefined if no element matches the predicate
        return undefined;
    };
}

// Check if method is already defined
if (!Array.prototype.rotate) {
    Array.prototype.rotate = function (count: number = 1, reverse: boolean = false) {
        // Check special cases for count
        if (count < 0) {
            // Throw error
            throw new Error("Parameter 'count' must be a positive number");
        } else if (count === 0) {
            // Return array
            return this;
        }

        // Decrease counter
        count = Math.floor(count);
        count %= this.length;

        // Check direction
        if (reverse) {
            // Shift elements up
            this.push(...this.splice(0, this.length - count));
        } else {
            // Shift elements down
            this.unshift(...this.splice(count, this.length));
        }

        // Return array
        return this;
    };
}

export {};
