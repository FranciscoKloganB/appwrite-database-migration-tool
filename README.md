# Appwrite Database Migration Tool

_**Disclaimer:** This NPM package is in a very early stage, please wait for v1.0.0 release to use on your own projects, unless you want to provide feedback or contribute._

## Roadmap to v1.0.0

- [x] Follow the setup steps from a consumer perspective on a live project;
- [x] Run codegen implementation from a consumer project;
- [x] Run the MigrationsCreateCollection from a consumer project;
- [ ] Run the MigrationsRunSequence from a consumer project;
- [ ] Run the one down sequence flow against live Appwrite databases from consuming proeject;
- [ ] Add integration tests with mocked Appwrite responses using MSW;

## Setting Up

### Common/Shared Steps

These steps only need to be made once*.

- Create a `GitHub Repository` to host your Appwrite functions.
  - You can use a repository you already own (e.g., `myproject-functions`).
- Create `environment` branches.
  - For example, the `main` branch can be assigned to `production` and `staging` branch can be
  assigned to `staging`. This allows you to have multiple Appwrite projects, using a single functions
  repository containing with multiple serverless entrypoints. Allowing you to effectively
  test a function in the staging project, before deploying the changes to the main (production)
  project.

### Environment Specific Steps

These steps need to be done per project that represents an application environment in which you want
to use the Appwrite Database Migration Tool processes.

#### Functions

Appwrite serverless functions require access to the source code that they need to execute. The source
is defined in Git repositories. Setups vary from team to team. Some choose to have one repository
per serverless function (isolation), while others prefer a single repository with a single `package.json`
for all functions (agility, low maintenance cost), others still, prefer a Monorepository structure
with all functions in a single repository, each with its own `package.json` (agility, isolation,
with higher upfront setup cost). No matter the strategy you must associate
the source repository with Appwrite serverless functions.

- [Appwrite Functions Docs](https://appwrite.io/docs/products/functions/deployment).
- [Appwrite Functions Video Series (~50m)](https://www.youtube.com/watch?v=UAPt7VBL_T8).

##### MigrationsCreateCollection

Create an Appwrite Function called `MigrationsCreateCollection` with the body below. The function
should point at the branch that contains the source for the "environment". E.g.: Point at the
`staging` branch on the `staging` project and point to `main` in the `production` project.

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

Create another Appwrite Function called `MigrationsRunSequence` with the body below. The function
should point at the branch that contains the source for the "environment".

- Over time you may want to tweak the timeout for this function
  - Default is 15s, increasae it up to a maximum of 15m in the function settings.
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

The functions below are optional. They are required for the `Appwrite Database Migration Tool` to
work. They exist for convinience when starting a project from scratch. When used, they should be
created following a strategy similar to the ones outlined in [Functions](#functions).

##### MigrationCreateDatabase

Creates a Database with `name` and `id` matching the environment variable `MIGRATIONS_DATABASE_ID`,
in the default case it will create a database called `Public`. If you already have a Database
and you prefer to manage the Migrations collection in it, you do not need this function. You also
do not need it, if you already created the `Public` manually.

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

#### Function Environment Variables

Both functions that you just created require access to the environment variables below. You can set
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

