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

const fileName = `${className}.js`;
const filePath = path.resolve(process.cwd(), outpath, fileName);
const fileContent = `
// @ts-check
import { MigrationFileEntity } from '@franciscokloganb/appwrite-database-migration-tool';

export default class ${className} extends MigrationFileEntity {
  constructor() {
    super();
  }

  /** @param {import('node-appwrite').Databases} databaseService */
  up(databaseService) {
    throw new Error('Method not implemented.');
  }

  /** @param {import('node-appwrite').Databases} databaseService */
  down(databaseService) {
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
