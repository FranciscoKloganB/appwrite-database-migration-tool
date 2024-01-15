# Appwrite Database Migration Tool

An appwrite database migration tool with the goal of making schema and data changes across
environments easier and more predictable.

_**We strongly recommend reading through the entire README, paying close attention to
[Setting-up](#setting-up) and [Recommendations](#recommendations) sections!**_

## Roadmap to v1.0.0

- [x] Follow the setup steps from a consumer perspective on a live project;
- [x] Run codegen implementation from a consumer project;
- [x] Run the MigrationsCreateCollection from a consumer project;
- [x] Run the MigrationsRunSequence from a consumer project;
- [x] Run the one down sequence flow against live Appwrite databases from consuming project;
- [ ] Add integration tests with mocked Appwrite responses using MSW;

## Roadmap to v2.0.0

### Improved fault tolerance (pseudo-transactional behaviour)

Currently, the `MigrationRunSequence` may fail while applying a user defined migration file.
If the migration fails, the steps that were taken during that particular migration file, are not
rolled back. Running the down method is an "OK" approach, but far from ideal, particularly on
bigger migrations which involve modifying collection data rather than just creating/deleting fields.

#### Possible Solution

Implement a superset of commands around `DatabaseService` using a `Memento` pattern to try to mimic
Transactions as much as possible. The solution involves `retries` with exponential backoff and would
require some interesting API changes. This means that `ADMT` would no longer just expose Appwrite
SDK `Databases` functionality, but would also have an API of commands that would intelligently
know how to rollback themselves if all retries were expended and a given step failed.

Something like the pseudo-code below:

```ts
class SomeMigration {
  async up({ db, error, log, sequence }) {
    await sequence
      .addStep({
        action: 'create',
        type: 'document',
        args: {
          ...argsToPassToDatabasesCreateDocumentMethod
        }
      }).addStep({
        action: 'update',
        type: 'document',
        args: {
          ...argsToPassToDatabasesCreateDocumentMethod
        },
        onError: async ({ db }) => {
          await db.executeCustomRollbackActionForThisStep()
        }
      })

    // For each command that is successfully executed in the sequence queue
    // Push a record to an executed stack
    // If some command N + x, x > 0 fails
    // Pop from the executed stack and execute reverse of action
    //   e.g.: delete document when action was create document
    await sequence.build().run()
  }
}
```

## Setting Up

### Common/Shared Steps

These steps only need to be made once*.

- Create a `GitHub Repository` to host your Appwrite functions.
  - You can use a repository you already own (e.g., `myproject-functions`).
- Create `environment` branches.
  - For example, the `main` branch can be assigned to `production` and `development` branch can be
  assigned to `staging`. This allows you to have multiple Appwrite projects, using a single functions
  repository containing multiple serverless entrypoints. Allowing you to effectively
  test a function in the staging project, before deploying the changes to the production project.

### Environment Specific Steps

These steps need to be done per project that represents an application environment in which you want
to use the Appwrite Database Migration Tool.

#### Functions

Appwrite serverless functions require access to the source code that they need to execute. The source
is defined in Git repositories. Setups vary from team to team. Some choose to have one repository
per serverless function (isolation), while others prefer a single repository with a single `package.json`
for all functions (agility, low maintenance cost), others still, prefer a Monorepository structure
with all functions in a single repository but each with its own `package.json` (agility, isolation,
with higher upfront setup cost). No matter the strategy you must associate the source repository
with Appwrite serverless functions.

- [Appwrite Functions Docs](https://appwrite.io/docs/products/functions/deployment).
- [Appwrite Functions Video Series (~50m)](https://www.youtube.com/watch?v=UAPt7VBL_T8).

##### MigrationsCreateCollection

###### Description

> Creates a collection (defaults to `Migration`) which acts as the source of truth for migrations that have been applied or not.

Create an Appwrite Function called `MigrationsCreateCollection` with the body below. The function
should point at the branch that contains the source for the "environment". E.g.: Point at the
`development` branch on the `staging` project and point to `main` in the `production` project.

  ```ts
  import { migrationsCreateCollection } from '@franciscokloganb/appwrite-database-migration-tool'

  export default async function(ctx) {
    await migrationsCreateCollection({
      log: ctx.log,
      error: ctx.error,
    })

    return ctx.res.empty();
  }
  ```

##### MigrationsRunSequence

> Retrieves all migrations, picks the pending (unapplied) migration (if exists) and executes the up method.

Create an Appwrite Function called `MigrationsRunSequence` with the body below. The function
should point at the branch that contains the source for the "environment".

- We recommend increase the maximum timeout for this function to 15m in the function settings.
- Ensure the migration files created in the future are included in the final function bundle.
  - An example on what this means is given on [FAQ](#faq) section.

  ```ts
  import { migrationsRunSequence } from '@franciscokloganb/appwrite-database-migration-tool'

  export default async function(ctx) {
    await migrationsRunSequence({
      log: ctx.log,
      error: ctx.error,
    })

    return ctx.res.empty();
  }
  ```

##### MigrationsOneDown

> Retrieves all migrations, picks the last applied migration (if exists) and executes the down method.

Create an Appwrite Function called `MigrationsOneDown` with the body below. The function
should point at the branch that contains the source for the "environment".

- We recommend increase the maximum timeout for this function to 15m in the function settings.
- Ensure the migration files created in the future are included in the final function bundle.
  - An example on what this means is given on [FAQ](#faq) section.

  ```ts
  import { migrationsRunSequence } from '@franciscokloganb/appwrite-database-migration-tool'

  export default async function(ctx) {
    await migrationsRunSequence({
      log: ctx.log,
      error: ctx.error,
    })

    return ctx.res.empty();
  }
  ```

#### Functions (Optional)

The functions below are optional. They exist for convinience. When used, they should be
created following similar strategies to the one outlined in previous [Functions](#functions) section.

##### MigrationCreateDatabase

Creates a Database with `name` and `id` matching the environment variable `MIGRATIONS_DATABASE_ID`,
in the default case it will create a database called `Public`. If you already have a Database
and you prefer to manage the Migrations collection in it, you do not need this function.

```ts
import { migrationsCreateDatabase } from '@franciscokloganb/appwrite-database-migration-tool'

export default async function(ctx) {
  await migrationsCreateDatabase({
    log: ctx.log,
    error: ctx.error,
  })

  return ctx.res.empty();
}
```

##### MigrationResetDatabase

Retrieves all collections which exist in the database associated with the environment variable
`MIGRATIONS_DATABASE_ID` and then deletes them. The closest SQL analogy for this serverless function
is `DROP TABLE IF EXISTS`. We recommend not setting this one up in your `production` project.

```ts
import { migrationsResetDatabase } from '@franciscokloganb/appwrite-database-migration-tool'

export default async function(ctx) {
  await migrationsResetDatabase({
    log: ctx.log,
    error: ctx.error,
  })

  return ctx.res.empty();
}
```

#### Function Environment Variables

All functions that you just created require access to the environment variables below. You can set
**them globally in your Appwrite project settings** or scope them to each function. If you opted
for the scoped approach **ensure** the values match across functions. Also, **ensure** the config
does not change over time if you run the `runMigrationSequence` at least once. The code is not
adapted for configuration changes. While they are possible, we do not recommend doing them, unless
you have a good reason and planned a transition. This includes updating environment variables,
build paths, function names, or repository changes. Mistakes can leave your application in
inconsistent states.

```properties
# Required
APPWRITE_FUNCTION_PROJECT_ID=<your-appwrite-project-id>
# Required
APPWRITE_API_KEY=<your-appwrite-api-key>
# Required
APPWRITE_ENDPOINT=<your-appwrite-endpoint>
# Defaults to 'Public'
MIGRATIONS_DATABASE_ID=<database-id>
# Defaults to 'Migrations'
MIGRATIONS_COLLECTION_ID=<collection-id>
# Defaults to 'Migrations'
MIGRATIONS_COLLECTION_NAME=<collection-name>
# Defaults to './migrations'
MIGRATIONS_HOME_FOLDER=<relative-path-to-folder-where-runner-finds-your-migrations>
```

#### Finalize ADMT Setup

- Execute `MigrationsCreateCollection` once and only once per environment/project.
  - We do prevent duplicate creations. 😇
  - Check that the `Migrations` collection was created with **at least** the following attributes
  (the `$id` attribute is not explicitly visible on the GUI):
    - `applied`: Boolean
    - `name`: String
    - `timestamp`: Integer

#### Create Your First Migration

- Use our codegen tool to create a new Migration JavaScript file. We give you type annotations
through JSDocs (works just like TypeScript) without needing you to do transpilation steps.
  - The codegen tool is `Node` and `Bun` compatible.
  - Your description will be converted to `PascalCase`.
    - Whitespaces are not allowed.

  ```bash
  # E.g.: npx admt new-migration --outpath ./functions/database/migrations --descriptor CreateProductsCollection
  npx admt new-migration --outpath <relative-path> --descriptor <migration-summary>
  ```

- Use the `databaseService` parameter of `up` and `down` to write your migration.
  - The `databaseService` is a subclass instance of `Databases` from `node-appwrite`.
  - The subclass provides some utility methods and properties on top of the normal `Databases`.
- Once you are done, deploy push your changes through the environment pipelines.
  - E.g.: Push to `staging` execute the `MigrationsRunSequence` function on Appwrite UI. Verify all
  is good. Finally push to `production` and run the sequence there.

## Usage, Rules, Recommendations and, FAQ

### Rules

- Migrations **must** complete within Appwrite Cloud defined timeout for the function (default is 15s).
  - Longer migrations should be run from local maching, by exporting variables in your `.env.local` for example.
- **Never** change the file name of a migration file.
- **Never** change the class name of a migration class.
- **Always** use codegen tools to create new migration files or other supported operations.

### Recommendations

#### Migrations in Appwrite

Whether you are applying changes to your Appwrite database through their GUI (website),
the Appwrite CLI, or using this package (ADMT), your changes are not guaranteed to be immediate.
Your request for changes are "Eventually Consistent". For example, when you ask Appwrite to create a
new attribute on a collection, that request goes to the queue. Eventually, a Worker picks up the
request and commits your change requests to your database. Meaning that changes are not immediate
and can (possibly?) occur out of order.

**What are the implications for you as a developer?**

Again, with an example. Assume you add an attribute `bar` to some existing collection. Shortly
after. you try to create a document with data `{ "bar": "hello" }`. While the request may succeed,
there is a chance you get an error informing that the format of the document is invalid and that
`bar` does not exist on collection `Foo` when you executethe statement. This can happen with any
other operation. Not just attributes and documents. Thus, to mitigate this issue, you should use the
`poll` function exported by this package whenever you need to perform dependant and sequential
operations in short time spans:

```js
await db.createStringAttribute('[DATABASE_ID]', '[COLLECTION_ID]', 'bar', 32, true)

// ❌ Bad code - Document creation likely to fail. Your request for attribute creation may still be queued.
await dbService.createDocument(
  '[DATABASE_ID]',
  '[COLLECTION_ID]',
  '[DOCUMENT_ID]',
  { "bar": "hello" },
)

// ✅ Better code - Document creation unlikely to fail. You give time for Appwrite to work on your request (if needed).
const [_, e] = await poll({
  fetcher: async () => await db.getCollection('[DATABASE_ID]', '[COLLECTION_ID]'),
  isReady: ({ attributes }) => attributes.includes('bar'),
});

if (e) {
  log(`Migration timed out. Unable to create '[DATABASE_ID]' documents.`)

  throw e
}

await dbService.createDocument(
  '[DATABASE_ID]',
  '[COLLECTION_ID]',
  '[DOCUMENT_ID]',
  { "bar": "hello" },
)
```

The poll function runs the `fetcher` you provide up to six times applying an exponential backoff per
try (0ms, 5000ms, 10000ms, 20000ms, 40000ms, 80000ms). Whenever the `fetcher` resolves, it calls the
is `isReady` method you provided. In turn, if `isReady` returns `true`, the `poll` function
resolves and returns the `fetcher` resolved data and a `null` error. **It is safe to call the next
operations in your flow**. Otherwise, `poll` returns `null` data and an array of `error` explaining
what went wrong. Particularly, the last `error` in the array will always be a generic `Error`
indicating a "max retries reached" message. If there was at least one `fetcher` rejection, the
original error(s) will be included on the errors array, in order of occurrence, before the generic
error. Rejections from `fetcher` and `isReady` "failures" are ignored if at least one fetcher
calls succeeds. The `poll` function never returns two non-null values at the same time!

_Note: `poll` accepts optional `log`/`error` functions for verbose debugging in your Appwrite console._

#### Migrations in General

- Avoid changing the contents of a migration that you have pushed to a production-like environment.
  - Unless you can confidently revert the database state (e.g.: staging) without affecting end-users.
- Provide a meaningful descriptions for your migration using the `--descriptor` flag.
  - Keep them short, like `git commit` messages.
- Follow the expand-and-contract pattern.
  - Read [here](https://www.prisma.io/dataguide/types/relational/expand-and-contract-pattern).
- Follow the single-responsibility principle.
  - We do not have direct access to Appwrite's MariaDB instances, thus no real transaction
  mechanisms are used.
  - It's better to do incremental migrations then one migration that might leave your app in an
  inconsistent state. Plan your migrations!
- Avoid abstractions in your migration files. They are subject to change in the future. If you use
them, ensure that whatever happens, the output of the migration up sequence is always the same. A
change of output in a migration M may cause a migration M + x, x > 0, to no longer work as intended.
- Test your migration locally and your staging environment before releasing to production!
- Mistakes happen. If you pushed to production and applying 'down' is not possible, we recommend
creating a new migration file to patch the issue.
  - If that is not possible, restore your database to a previous point-in-time (backup).

### FAQ

1. How do I bundle my migrations in the final function bundle?
  a. Please note that currently Bun as an upstream issue with Axios, and fails to execute our
  functions due to missing `http` adapters. In the mean time I suggest you use plain `.js` files.

    a. You can track that issue here: <https://github.com/oven-sh/bun/issues/3371>,

    > How you bundle your migrations depends on your overall language choices and how you choose
    > to set up your Appwrite Function source repository structure. My personal setup using
    > a Bun based functions has the following Function Configurations.
    > Please note that appwrite does not allow you to do `newline` with continuation markers `\` like
    > I did in the example below example (for readability purposes). It expects the entire command
    > to be written in one line.
    > The `copy` command will only work if the folder already exists in your remote repository.

    ```code
    Entrypoint: ./dist/database/migrations-run-sequence.js
    Build Settings: \
      bun install --production \
      && bun build ./functions/database/migrations-run-sequence.ts --outdir ./dist/database \
      && mkdir ./dist/database/migrations \
      && cp -r ./functions/database/migrations ./dist/database/migrations ;
    ```

2. My migrations are not being found when I execute `MigrationRunSequence`.

    > When Appwrite invokes a serverless function it automatically searches for your entrypoint
    > starting at `/usr/local/server/src/function/*`. Our code on the other hand, uses
    > `current working directory` to start searching for files. Appwrite serverless CWD is
    > `/usr/local/server/*`, meaning you need to modify your `MIGRATIONS_HOME_FOLDER` to consider the
    > `src` and `function` path segments if applicable.

3. I am getting scope errors when I execute the functions.

   > When we create an Appwrite Server Client (node-appwrite SDK), we use the APPWRITE_API_KEY you
   > provide to set it up. If you are getting scope errors, similar to these ones
   > "Error: <app.xxxxxxxxxx@service.cloud.appwrite.io> (role: applications) missing scope
   > (collections.read)", it's because you need to add more scopes to your APPWRITE_API_KEY.
   > You can do that by accessing `Project > Settings > API credentials > View API Keys > { Select
   > API KEY } > Scopes`; From here onwards, you need to add the scopes that are missing.
