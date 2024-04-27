import { defineConfig } from 'taze'

export default defineConfig({
  exclude: ['change-case', 'nanoid'],
  force: true,
  includeLocked: false,
  install: false,
  mode: 'minor',
  recursive: true,
  sort: 'name-asc',
  write: true,
  depFields: {
    overrides: false,
  },
})
