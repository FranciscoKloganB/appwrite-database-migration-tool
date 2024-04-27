import { program } from 'commander'

import { newMigration } from '@cli/actions'

function validatePath(value: string) {
  if (!value.startsWith('./')) {
    console.error('Error: Invalid relative path. It should start with "./".')
    process.exit(1)
  }

  return value
}

function validateDescription(value: string) {
  if (/\s/.test(value)) {
    console.error('Error: Description should not contain spaces.')
    process.exit(1)
  }

  return value
}

program.version('1.0.0').description('Appwrite Database Migration Tool')

program
  .command('new-migration')
  .description('Scaffold a new migration file')
  .option(
    '-d, --descriptor <description>',
    'Short description for the migration file',
    validateDescription,
  )
  .option(
    '-o, --outpath <relative-path>',
    'Relative path where the migration file will be created',
    validatePath,
  )
  .action(({ outpath, descriptor }) => {
    newMigration({ outpath, descriptor })
  })

program.parse(process.argv)
