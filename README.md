# Appwrite Database Migration Tool

_**Disclaimer:** This NPM package is in a very early stage, please wait for v1.0.0 release to use on your own projects, unless you want to provide feedback or contribute._

## Roadmap to v1.0.0

- [x] Follow the setup steps from a consumer perspective on a live project;
- [x] Run codegen implementation from a consumer project;
- [x] Run the Migrations Create Collection from a consumer project;
- [ ] Run the Migrations Run Sequence from a consumer project;
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

#### Functions

These steps need to be done per project that represents an applicatio environment in which you want
to use the Appwrite Database Migration Tool processes.

- Associate the repository with Appwrite Serverless function source.
  - [Appwrite Functions Docs](https://appwrite.io/docs/products/functions/deployment).
  - [Appwrite Functions Video Series (~50m)](https://www.youtube.com/watch?v=UAPt7VBL_T8).
- Create a Appwrite Database
  - Not needed if you already have a Database.
- Create an Appwrite Function, one called `Migrations Create Collection` with the body below.
  - The function should point at the branch that contains the source for the "environment".
  - Tweak the timeout (default is 15s, increasae it up to a maximum of 15m) in the function settings.

  ```ts
  import { createMigrationCollection } from '@franciscokloganb/appwrite-database-migration-tool'

  export default async (ctx) => {
    await createMigrationCollection({
      log: ctx.log,
      error: ctx.error,
    })

    return ctx.res.empty();
  }
  ```

- Create another Appwrite Function, called `Migrations Run Sequence` with the body below.
  - The function should point at the branch that contains the source for the "environment".
  - Ensure the migration files you create in the future are included in the final function bundle.
    - An example on what this means is given on [FAQ](#faq) section.

    ```ts
    import { runMigrationSequence } from '@franciscokloganb/appwrite-database-migration-tool'

    export default async (ctx) => {
      await runMigrationSequence({
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
APPWRITE_API_KEY=<your-appwrite-api-key>
# Required
APPWRITE_ENDPOINT=<your-appwrite-endpoint>
# Required (when running locally instead of a serverless function environment)
APPWRITE_FUNCTION_PROJECT_ID=<your-appwrite-project-id>
# Required
MIGRATIONS_DATABASE_ID=<database-id>
# Defaults to 'appwritedatabasemigrationtool'
MIGRATIONS_COLLECTION_ID=<collection-id>
# Defaults to 'Migrations'
MIGRATIONS_COLLECTION_NAME=<collection-name>
# Defaults to './migrations'
MIGRATIONS_HOME_FOLDER=<relative-path-to-folder-where-runner-finds-your-migrations>
```

#### Finalize ADMT Setup

- Execute `Migrations Create Collection` once and only once per environment/project.
  - We do prevent duplicate creations. 😇
  - Check that the `Migrations` collection was created with **at least** the following attributes:
    - `$id`: String
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
  - The parameter is an instance of a subclass of `node-appwrite` Databases class.
  - The subclass provides some utility methods and properties on top of the normal `Databases`.
- Once you are done, deploy push your changes through the environment pipelines.
  - E.g.: Push to `staging` execute the `Migrations Run Sequence` function on Appwrite UI. Verify all
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
  functions due to missing `http` adapters. You can track that issue here: <https://github.com/oven-sh/bun/issues/3371>,
  in the mean time I suggest you use plain `.js` files.

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

2. I am getting scope errors when I execute the functions.

   > When we create an Appwrite Server Client (node-appwrite SDK), we use the APPWRITE_API_KEY you
   > provide to set it up. If you are getting scope errors, similar to these ones
   > "Error: <app.xxxxxxxxxx@service.cloud.appwrite.io> (role: applications) missing scope
   > (collections.read)", it's because you need to add more scopes to your APPWRITE_API_KEY.
   > You can do that by accessing `Project > Settings > API credentials > View API Keys > { Select
   > API KEY } > Scopes`; From here onwards, you need to add the scopes that are missing.

