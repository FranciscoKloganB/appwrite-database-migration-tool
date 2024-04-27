export class DuplicateMigrationError extends Error {
  constructor() {
    super(
      'Found duplicate migration files. There are at least two files with the same class name. We suggest using our codegen tools when you need to write new migration files.',
    )
  }
}
