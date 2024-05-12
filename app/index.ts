/* eslint-disable @typescript-eslint/no-var-requires */
// CommonJS require
// const ADMT = require('@franciscokloganb/appwrite-database-migration-tool');
// console.log('CJS require import:', typeof ADMT.createMigrationCollection === 'function');

/** ModuleJS synthetic and/or default import */
// import SPKG from '@franciscokloganb/appwrite-database-migration-tool';

// console.log('MJS synthetic default:', typeof SPKG.createMigrationCollection === 'function');

/**  ModuleJS aliased import */

/**  ModuleJS Destruct MJS import  */
import * as APKG from '@franciscokloganb/appwrite-database-migration-tool'
import { createMigrationCollection } from '@franciscokloganb/appwrite-database-migration-tool'

console.log(
  'MJS named import as aliased object:',
  typeof APKG.createMigrationCollection === 'function',
)

console.log(
  'MJS named import destruct:',
  typeof createMigrationCollection === 'function',
)
