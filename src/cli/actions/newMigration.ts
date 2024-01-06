import fs from 'fs';
import path from 'path';
import { pascalCase } from 'change-case';

export function newMigration({ outpath, descriptor }: { outpath: string; descriptor: string }) {
  const description = pascalCase(descriptor);
  const timestamp = Date.now();

  const className = `Migration_${timestamp}_${description}`;

  const fileName = `${className}.js`;
  const filePath = path.resolve(process.cwd(), outpath, fileName);
  const fileContent = `
// @ts-check
import { MigrationFileEntity } from '@franciscokloganb/appwrite-database-migration-tool';

class ${className} extends MigrationFileEntity {
  constructor() {
    super();
  }

  /**
   * @param {import('@franciscokloganb/appwrite-database-migration-tool').DatabaseService} dbService
   */
  async up(dbService) {
    throw new Error('Method not implemented.');
  }

  /**
   * @param {import('@franciscokloganb/appwrite-database-migration-tool').DatabaseService} dbService
   */
  async down(dbService) {
    throw new Error('Method not implemented.');
  }
}

export default ${className};
`.trim();

  // Create directories if they don't exist
  const fileDirectory = path.dirname(filePath);

  if (!fs.existsSync(fileDirectory)) {
    fs.mkdirSync(fileDirectory, { recursive: true });
  }

  fs.writeFileSync(filePath, fileContent);

  console.log(`✅ Scaffold completed. Migration file created at: ${filePath}.`);
}
