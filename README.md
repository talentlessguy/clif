# clif

> ⚠️ heavy work in progress

middleware-based CLI framework.

## Install

```sh
pnpm i clif
```

## Example

```sh
import { Clif } from 'clif'

const cli = new Clif({ name: 'bakery' })

cli
  .command('cook [bun]')
  .option({ flavor: { type: 'string', required: true }})
  .action(([bun], { flavor }) => console.log(`Cooking ${bun} with ${flavor}...`))
  .help()

cli.parse()
```

## Features

- 🌯 Supports sub-commands (e.g. `my-cli project create`)
- 🤖 Automatic help/version commands
- Supports boolean, string and number arguments
