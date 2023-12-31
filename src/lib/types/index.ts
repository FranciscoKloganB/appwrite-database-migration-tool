export type Logger = (msg: string) => void;

/**
 * Modes in which transactions maybe ran
 *
 * - each: migration files are executed in a seperate transaction, in sequence
 */
export type TransactionMode = 'each';
