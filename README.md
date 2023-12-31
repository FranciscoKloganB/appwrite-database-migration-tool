# Appwrite Database Migration Tool

_**Disclaimer:** This NPM package is in a very early stage, please wait for v1.0.0 release to use on your own projects, unless you want to provide feedback or contribute._

## Roadmap to v1.0.0

- [] Run codegen implementation from a consuming project;
- [] Run the setup implementation against live Appwrite databases from a consuming project;
- [] Run the run migration sequence implementation against live Appwrite databases from a consuming project;
- [] Create one down sequence flow
- [] Run the one down sequence flow against live Appwrite databases from consuming proeject;
- [] Add integration tests with mocked Appwrite responses using MSW;

## Setting up

- Create a `GitHub Repository` to host your Appwrite functions.
  - You can use a repository you already own (e.g., `myproject-functions`).
- Create `environment` branches.
  - For example, the `main` branch can be assigned to `production` and `staging` branch can be
  assigned to `staging`. This allows you to have multiple Appwrite projects, using a single functions
  repository containing with multiple serverless entrypoints. Allowing you to effectively
  test a function in the staging project, before deploying the changes to the main (production)
  project.
- Set the repository as the Appwrite Serverless functions source.
  - [Appwrite Functions Docs](https://appwrite.io/docs/products/functions/deployment).
  - [Appwrite Functions Video Series (~50m)](https://www.youtube.com/watch?v=UAPt7VBL_T8).
- Create a Appwrite Database per environment (project).
  - Not needed if you already have a Database.
- Create two Appwrite Functions, one called `Create Migrations Collection` and another called
`Run Migration Sequence`.
  - Do this once per project.
  - Point the functions at different branches of the repository
    - E.g.: point to main branch in production project, point to staging branch in the staging project.
  - Add the following contents to your functions respectively:

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

## Best Practises for Database Migration

**There are recommendations that will help keep your team sane and safe.**

- Always provide a meaningful descriptor for your migration.
- Attempt to follow the single-responsibility principle. Appwrite Cloud does not provide us with direct database access. That means we do not have real transaction mechanisms. Consequently, we recommend doing migrations in small steps. Remember, Appwrite Cloud Functions timeout after 15s, and you cannot perform a transaction over several collections and easily rollback all changes if something in that transaction fails.
- Always follow the expand-and-contract pattern, if required. Read [here](https://www.prisma.io/dataguide/types/relational/expand-and-contract-pattern).
- Never change the file name of a migration file.
- Never change the class name of a migration class.
- Never change the contents of a migration that you have pushed to a production-like environment.
- Avoid abstractions in your migration files. They are subject to change in the future. If you use them, ensure that whatever happens, the output of the migration up sequence is always the same regardless. A change of output in a migration M may cause a migration M + x, x > 0, to no longer work as intended.
- Test your migration locally and your staging environment before releasing to production!
- Mistakes happen. If you pushed to production and applying 'down' is not possible, we recommend creating a new migration file to patch the issue. If that is not possible, restore your database to a previous point-in-time (backup) and apologize to your users.

**See also:** [Prisma - Expand and Contract Pattern](https://www.prisma.io/dataguide/types/relational/expand-and-contract-pattern)
