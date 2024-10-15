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
    Array.prototype.asyncFind = function <T>(
        predicate: (element: T, key: number, array: T[]) => Promise<boolean>,
        thisArg?: T[]
    ): T | undefined {
        /**
         * Predicate with replaced "this" object
         */
        const boundPredicate = predicate.bind(thisArg);

        this.forEach(async (_, index) => {
            // Check if callback function returns true for element
            if (await boundPredicate(this[index], index, this)) {
                return this[index];
            }
        });

        return undefined;
    };
}

// Check if method is already defined
if (!Array.prototype.rotate) {
    Array.prototype.rotate = function (count: number = 1, reverse: boolean = false) {
        // Check special cases for count
        if (count < 0) {
            throw new Error("Parameter 'count' must be a positive number");
        } else if (count === 0) {
            return this;
        }

        count = Math.floor(count);
        count %= this.length;

        // Check direction
        if (reverse) {
            this.push(...this.splice(0, this.length - count));
        } else {
            this.unshift(...this.splice(count, this.length));
        }

        return this;
    };
}

export {};
