/**
 * Task that can be called to perform a promise based action. Represents a function that returns a promise,
 * commonly used for asynchronous operations that can be scheduled or executed later.
 */
export type Task<ReturnType> = () => Promise<ReturnType>;
