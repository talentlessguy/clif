import { baseOptions, parseArgv } from './parser.js'
import { Command, Options, ParserConfig } from './types.js'

export class Clif {
  name: string
  description?: string
  #commands: Command<any>[] = []
  #defaultCommand?: Command<any>
  #version?: string
  #argv: string[]
  #config: ParserConfig
  constructor({
    name,
    description,
    argv = process.argv,
    version,
    ...conf
  }: {
    name: string
    description?: string
    argv?: string[]
    version?: string
  } & ParserConfig) {
    this.name = name
    this.description = description
    this.#argv = argv
    this.#version = version
    this.#config = conf
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
      const { options, unknownOptions, positionals } = baseOptions(
        argv,
        this.#defaultCommand.options,
        this.#config
      )
      if (options['help']) return console.log(`help`)
      if (options['version'])
        return process.stdin.write(`${this.name} ${this.#version}\n`)
      this.#defaultCommand.action(positionals, options, unknownOptions)
    }
  }
  help() {}
}

const cli = new Clif({ name: 'flash', strict: false })

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
    value: { type: 'boolean', description: 'Command value' },
  },
  action: (args, options, unknownOptions) => {
    console.log({ args, options, unknownOptions })
  },
})

cli.version('0.0.0')

cli.parse()
