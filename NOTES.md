
## Description

Packages can do many things for you. To name a few, these range from utility functions
to complete frameworks, data structure management solutions or communication protocols.
This example template provides a package with a single function named
`toHumanReadableString`, which formats a data-like value to consistent string output.

This could be useful to ensure our frontend consumers render data to the screen in
similar fashion regardless of the original data value source.

## Configuration

Code quality is set up for you with `prettier`, `eslint`, `husky`, and
`lint-staged`. Depending on the package goals, you might need to add some
plugins. Adjust `package.json` accordingly.

### Bundle Analysis

[size limit](https://github.com/ai/size-limit) is set up to calculate
the real cost of your library with `npm run size` and visualize the bundle
with `npm run analyze`.

### Jest

Jest tests are set up to run with `npm test` or `npm test:headless`. If you
are developing a package for `React.js` or `Next.js` further packages need to be
added.

### Path Aliases

We use [alias-hq](https://github.com/davestewart/alias-hq) to simplify path
aliasing during development; Configure paths once in `tsconfig.json` and have
remaining tools like `jest` integrate automatically with the available
`tsconfig` by invoking a simple function provided by `alias-HQ;

### Dependencies

Take care when adding new dependencies to the project. When you add a new
production dependency (`dependencies` in `package.json`), these will also
be installed a `production` or `development` dependencies in the consumer
projects (depending on their usage of `--save-dev`). When you add a package to
`devDependencies` these are not propagated to consumers. Ideally, if you want
to ensure that consumers have a package installed on their project, that is
needed for your project to work, without risking conflicts with them, you should
declare such packages as `peerDependencies` which are installed in case the
consumer does not have them yet. Otherwise `peerDependencies` ensures version
the consumer has, is compatible with what is requested.

#### TLDR

- `dependencies` indirectly forces consumers to have your dependencies.
- `devDependencies` do not affect consumers.
- `peerDependencies` ensures consumers install the correct version of a packages you
need to operate, but do not necessarely depend on.

### Publishing

Add all expected environment variables (see `.env.example`) to your `.zshrc` or
`.bashrc` profile. Alternatively, install `direnv`, then, add a `.env` file
in the root of the project containing those same environment variables.

Finally, execute the commands below

```bash
# Create a PAT (write package permissions) for your GitHub user on the website
# This should be somewhere under Profile > Settings > Developer Settings
# Export the following environment variables or use `direnv` / `dotenv`:
export NPM_USER=<your_lowercased_github_username>
export NPM_PASS=<your_github_pat_with_packages_write_permission>
export NPM_EMAIL=<your_github_email>
export NPM_REGISTRY=https://npm.pkg.github.com/
export NPM_SCOPE=<owner-or-organization>
# Source your profile and execute:
npm-cli-login -u $NPM_USER -p $NPM_PASS -e $NPM_EMAIL -r $NPM_REGISTRY -s $NPM_SCOPE

# Verify the previous process
# Check global .npmrc (ensure you see your auth token (PAT) and the org registry)
# Check also your `whoami` just in case
cat ~/.npmrc
npm whoami --scope=@owner-or-organization --registry=https://npm.pkg.github.com/

# Kickstart the actual publishing process
npm run release -- --first-release
npm run release -- --release-as patch
npm run release -- --release-as minor
npm run release -- --release-as major
```

#### What should I do before releasing?

You should run a healthy amount of automated tests and ideally, test your
library on a dummy-app, if it is somewhat complex; If it is a simple utility
library you can tweak `./app/index.ts` and use `testpkg.sh` to print some
`console.log` statements;

#### What scripts run when releasing?

When you run `npm run release -- args` a handful of precommand, command, and
postcommand scripts are executed. Below is the order in which they resolve!

```bash
2. prerelease # checkout to main, updates local codebase and runs static-analysis
3. prebuild # cleans current dist folder
4. build # runs microbundle commands to generate a new dist folder
5. release # executes at this point to generate standard-version and changelogs
6. postrelease # pushes the created tags to remote and starts publishing process
7. prepack # disables postinstall script to avoid conflict on consumers
8. prepare # executes default prepare script (gzip of package.json.files + package.json itself)
9. postpack # reenables postinstall script
10. publish # pushes gzip to remote registry.
```

#### How can consumers of our package use our utilities?

We export our configurations in multiple formats on `package.json`. See short
example below:

```jsonc
{
  // only used by microbundle:
  // define the entry point for your package
  "source": "./index.ts",
  // tells microbundle where to place the package's type definitions after TypeScript compilation
  "types": "./dist/index.d.ts",
  // CommonJS:
  "main": "./dist/index.js",
  "exports": {
    // Node CommonJS:
    "require": "./dist/index.js",
    // Node EcmaSscriptModule (ModuleJS): import X from Y || import { a } from Y
    "default": "./dist/index.modern.mjs"
  },
  // Bundler EcmaSscriptModule (ModuleJS, ModernJS):
  "module": "./dist/index.module.js",
  // Unpkg/CDN UMD:
  "unpkg": "./dist/index.umd.js",
  // We only publish our `dist/` folder, `README.md`, and `package.json` on npm
  "files": ["dist"]
}
```

## Continuous Integration

### GitHub Actions

Three actions are added by default:

- `main` which installs deps w/ cache, lints, tests, and builds against
  a _Node vs. OS_ matrix
- `size` which comments cost comparison of your library on every pull
  request using [`size-limit`](https://github.com/ai/size-limit)
- `publish` a workflow that is currently under development, which would be
  responsible for automatically publishing the repository to GitHub packages
  when a new the non-draft release is created and published; Until this workflow
  is ready, prefer using the manual approach detailed below.

## Module Formats

CJS, ESModules, and UMD module formats are supported. The appropriate paths are
configured in `package.json`. Read more at [microbundle](https://github.com/developit/microbundle)

## Named Exports

Per Palmer Group guidelines, you should prefer [named exports.](https://github.com/palmerhq/typescript#exports).
This allows code-splitting inside a consumer application instead of the exported
library. E.g.: a react app using this lib will optimize this library better if
we export named modules rather than default modules.

## More information

### GitHub NPM registry (packages)

- [Setup CI Node](https://github.com/actions/setup-node#usage)
- [Authenticating](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages)
- [Publishing](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#publishing-a-package)
- [Installing](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package)

### Bumping dependencies and updating package.json

To update the project's dependencies and `package.json` at the same time
run the commands below.

```bash
npm install -g npm-check-updates
ncu -u
npm install
```
