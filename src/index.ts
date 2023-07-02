import { baseOptions, parseArgv } from './parser.js'
import { Command, Options } from './types.js'

export class Clif {
  name: string
  description?: string
  #commands: Command<any>[] = []
  #defaultCommand?: Command<any>
  #version?: string
  #argv: string[]
  constructor({
    name,
    description,
    argv = process.argv,
    version,
  }: {
    name: string
    description?: string
    argv?: string[]
    version?: string
  }) {
    this.name = name
    this.description = description
    this.#argv = argv
    this.#version = version
  }
  command<O extends Options = Options>(cmd: Command<O>) {
    if (cmd.name === undefined) this.#defaultCommand = cmd
    else if (['version', 'help'].includes(cmd.name))
      throw new Error(`Use cli.${cmd.name}() instead`)
    else this.#commands.push(cmd)
    return this
  }
  version(version: string) {
    this.#version = version
  }
  parse(argv = process.argv.slice(2)) {
    if (this.#defaultCommand) {
      console.log(baseOptions(argv, this.#defaultCommand.options))
    }
  }
}

const cli = new Clif({ name: 'flash' })

// cli.command({
//   name: 'test',
//   action: (args, options) => {
//     console.log('testing')
//   },
// })

cli.command({
  description: 'deploy on Flash',
  options: {
    name: { type: 'number', required: false, alias: 'n' },
    value: { type: 'boolean' },
  },
  action: (args, options) => {
    console.log(options.name, options.value)
  },
})

cli.version('0.0.0')

cli.parse()
