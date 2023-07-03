import { baseOptions, parseArgv } from './parser.js'
import { Command, Options, ParserConfig } from './types.js'
import * as color from 'colorette'
import { getBorderCharacters, table } from 'table'

export class Clif {
  name: string
  description?: string
  #commands: Command<any>[] = []
  #defaultCommand?: Command<any>
  #version?: string
  #config: ParserConfig
  #helpEnabled?: boolean
  constructor({
    name,
    description,
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
    this.#version = version
    this.#config = conf
  }
  command<O extends Options = Options>(cmd: Command<O>) {
    if (cmd.name === undefined) this.#defaultCommand = cmd
    else this.#commands.push(cmd)
    return this
  }
  version(version: string) {
    this.#version = version
  }
  parse(argv = process.argv.slice(2)) {
    const command = this.#commands.find((x) => x.name === argv[0])

    if (command) {
      const { options, unknownOptions, positionals } = parseArgv(
        argv,
        command.options,
        this.#config
      )

      if (options['help'] && this.#helpEnabled) return this.#help(command.name)
      return command.action(positionals, options, unknownOptions)
    }

    if (this.#defaultCommand) {
      const { options, unknownOptions, positionals } = baseOptions(
        argv,
        this.#defaultCommand.options,
        this.#config
      )
      if (options['help'] && this.#helpEnabled) return this.#help()
      if (options['version'] && this.#version)
        return console.info(`${this.name} ${this.#version}\n`)
      return this.#defaultCommand.action(positionals, options, unknownOptions)
    }
  }
  #helpMessage({
    name,
    options,
    description,
    usage,
  }: {
    name: string
    options: Options
    description?: string
    usage?: string
  }) {
    const entries = Object.entries(options)
    const hasOptions = entries.length !== 0

    console.info(
      [
        description ? `${`${description}\n`}` : '',
        `${`Usage:\n    ${
          usage || ` ${name} ${hasOptions ? '[OPTIONS]' : ''}`
        }`}\n`,
        hasOptions ? 'Options:' : undefined,
        table(
          entries.map(([name, opt]) => [
            `--${name}${opt.alias ? `, -${opt.alias}` : ''}`,
            opt.description || '',
          ]),
          {
            border: getBorderCharacters('void'),
            columnDefault: {
              paddingLeft: 4,
            },
            drawHorizontalLine: () => false,
          }
        ),
      ]
        .filter((x) => x !== undefined)
        .join('\n')
    )
  }
  #help(cmdName?: string) {
    if (cmdName) {
      const cmd = this.#commands.find((x) => x.name === cmdName)
      if (cmd?.name) {
        this.#helpMessage({
          name: cmd.name,
          description: cmd.description,
          options: cmd.options,
          usage: cmd.usage,
        })
      }
    } else if (this.#defaultCommand) {
      this.#helpMessage({
        name: this.name,
        description: this.#defaultCommand.description || this.description,
        options: this.#defaultCommand.options,
        usage: this.#defaultCommand.usage,
      })
    }
  }
  help() {
    this.#helpEnabled = true
  }
}
