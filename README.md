# Using migration-tool

## Setting up

- Create a `GitHub Repository` to host your Appwrite functions or use one you already have (e.g., `myproject-functions`);
  - Setup this repository as the Appwrite Serverless functions source;
    - [Appwrite Functions Docs](https://appwrite.io/docs/products/functions/deployment)
    - [Appwrite Functions Video Series (~50m)](https://www.youtube.com/watch?v=UAPt7VBL_T8)
- Create a Appwrite Database or use one that already exists.
- Create two Appwrite Functions, one called `Create Migrations Collection` and another called
`Run Migration Sequence`.
  - Modify the entrypoint of your functions (usually `index.ts` or `main.ts`), such that their
  contents the ones below, respectively:

    ```ts
    import { createMigrationCollection } from '@franciscokloganb/appwrite-database-migration-tool'

    export default async (ctx) => {
      await createMigrationCollection({
        log: ctx.log,
        error: ctx.error,
      })
    }
    ```

    ```ts
    import { runMigrationSequence } from '@franciscokloganb/appwrite-database-migration-tool'

    export default async (ctx) => {
      await runMigrationSequence({
        log: ctx.log,
        error: ctx.error,
      })
    }
    ```

- Each function will require access to the following environment variables.
  - You can set them globally in your Appwrite project or scope them to each function.
  - _**Warning:** Ensure the values match across functions, if you opted for the scoped approach._
  - _**Warning:** Ensure the config does not change, if you ran the `runMigrationSequence` at least once._
  - _**Warning:** Config can be changed anytime. We don't recommended it. Mistakes can cause synch issues._

  ```properties
  # Required
  APPWRITE_API_KEY=<your-appwrite-api-key>
  # Required
  APPWRITE_ENDPOINT=<your-appwrite-endpoint>
  # Required
  MIGRATIONS_DATABASE_ID=<database-id>
  # Defaults to 'appwritedatabasemigrationtool'
  MIGRATIONS_COLLECTION_ID=<collection-id>
  # Defaults to 'Migrations'
  MIGRATIONS_COLLECTION_NAME=<collection-name>
  # Defaults to './migrations'
  MIGRATIONS_HOME=<relative-path-to-folder-where-runner-finds-your-migrations>
  ```

- Execute `Create Migrations Collection` once and only once per `project` / `environment`.
  - We prevent duplicate creations, but why take chances. 😇
  - Double check that the `Migrations` collection was created with the following attributes:
    - `$id`: String
    - `applied`: Boolean
    - `name`: String
    - `timestamp`: Integer

- Create your first migration (you should use this script everytime you want to create a new migration).
  - This script is `Node.js` compatible.
  - Your description will be converted to `PascalCase`.
    - Do not use whitespaces
    - Do not use underscores

  ```bash
  npx @franciscokloganb/appwrite-database-migration-tool/codegen/migration.js \
    <relative-path-to-your-migration folder> \
    <short-migration-description> ;
  ```

- Use the `databaseService` parameter of `up` and `down`, which is an instance of `node-appwrite` Databases class, to define your migration file contents.
- Once you are done, deploy your changes and execute the `Run Migration Sequence` function.
