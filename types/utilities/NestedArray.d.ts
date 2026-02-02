/**
 * Nested array with unknown depth. Used for representing hierarchical data structures where arrays can contain
 * other arrays of the same type.
 */
export type NestedArray<Type> = Array<Type | NestedArray<Type>>;
