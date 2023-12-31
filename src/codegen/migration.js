import fs from 'fs';
import path from 'path';
import { pascalCase } from 'change-case';

const [outpath, descriptor] = process.argv.slice(2);

if (!(outpath && descriptor)) {
  console.error('✍️ Usage: node awm-codegen.js <relative-path> <description>');
  process.exit('❌ Scaffold failed. Invalid arguments.');
}

const description = pascalCase(descriptor);
const timestamp = Date.now();

const className = `Migration_${timestamp}_${description}`;

const fileName = `${className}.ts`;
const filePath = path.resolve(process.cwd(), outpath, fileName);
const fileContent = `
import { MigrationFileEntity } from '@franciscokloganb/appwrite-database-migration-tool';
import type { Databases } from 'node-appwrite';

/**
 * Recommendations that will keep you and your team sane and safe from being fired.
 * - Always provide a meaningful descriptor for your migration.
 * - Attempt to follow the single-responsability priciple. Appwrite Cloud does not provides us with
 * direct database access. That means we do not have real transaction mechanisms. Consequently, we
 * recommend doing migrations in small steps. Remember, Appwrite Cloud Functions timeout after 15s
 * and you can not perform a transaction over several collections and easily rollback all changes if
 * something in that transaction fails.
 * - Always follow the expand-and-contract pattern, if required. Read below.
 * - Never change the file name of a migration file.
 * - Never change the class name of a migration class.
 * - Never change the contents of a migration that you have pushed to a production like environment.
 * - Avoid abstractions in your migration files. They are subject to change in the future. If you
 * use them ensure that whatever happens, the output of the migration up sequence is always the same
 * regardless. A change of output in a migration M may cause a migration M + x, x > 0, to no longer
 * work as intended.
 * - Test your migration locally and your staging environment before releasing to production!
 * - Mistakes happen. If you pushed to production and applying 'down' is not possible, we recommend
 * creating a new migration file to patch the issue. If that is not possible restore your database
 * to a previous point-in-time (backup) and apologize to your users.
 *
 * @see https://www.prisma.io/dataguide/types/relational/expand-and-contract-pattern
 */
export default class ${className} extends MigrationFileEntity {
  constructor() {
    super();
  }

  up(databaseService: Databases): boolean {
    throw new Error('Method not implemented.');
  }

  down(databaseService: Databases): boolean {
    throw new Error('Method not implemented.');
  }
}
`.trim();

// Create directories if they don't exist
const fileDirectory = path.dirname(filePath);

if (!fs.existsSync(fileDirectory)) {
  fs.mkdirSync(fileDirectory, { recursive: true });
}

fs.writeFileSync(filePath, fileContent);

console.log(`✅ Scaffold completed. Migration file created at: ${filePath}.`);
