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

    const { options, unknownOptions, positionals } = baseOptions(
      argv,
      {} || this.#defaultCommand?.options,
      this.#config
    )

    if (options['help'] && this.#helpEnabled) return this.#help()
    if (options['version'] && this.#version)
      return console.info(`${this.name} ${this.#version}\n`)

    if (this.#defaultCommand) {
      return this.#defaultCommand.action(positionals, options, unknownOptions)
    }
  }
  #helpMessage({
    name,
    options,
    description,
    usage,
    commands,
  }: {
    name: string
    options?: Options
    description?: string
    usage?: string
    commands?: Command[]
  }) {
    if (options) {
      const entries = Object.entries(options)
      const hasEntries = entries.length !== 0
      process.stdin.write(
        [
          description ? `${`${description}\n`}` : undefined,
          `${`${color.underline('Usage:')}\n    ${
            usage || ` ${name} ${hasEntries ? '[OPTIONS]' : ''}`
          }`}\n`,
          hasEntries ? color.underline('Options:') : undefined,
          hasEntries
            ? table(
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
              )
            : undefined,
        ]
          .filter((x) => x !== undefined)
          .join('\n')
      )
    } else if (commands) {
      const hasCommands = this.#commands.length !== 0
      process.stdin.write(
        [
          description ? `${`${description}\n`}` : undefined,
          `${`${color.underline('Usage:')}\n    ${
            usage || ` ${name} ${hasCommands ? '[OPTIONS]' : ''}`
          }`}\n`,
          hasCommands ? color.underline('Commands:') : undefined,
          hasCommands
            ? table(
                commands.map((cmd) => [cmd.name, cmd.description || '']),
                {
                  border: getBorderCharacters('void'),
                  columnDefault: {
                    paddingLeft: 4,
                  },
                  drawHorizontalLine: () => false,
                }
              )
            : undefined,
        ]
          .filter((x) => x !== undefined)
          .join('\n')
      )
    }
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
    } else {
      this.#helpMessage({
        name: this.name,
        ...(this.#defaultCommand
          ? {
              description: this.#defaultCommand?.description,
              options: this.#defaultCommand?.options || {},
              usage: this.#defaultCommand?.usage,
            }
          : {
              description: this.description,
              commands: this.#commands,
            }),
      })
    }
  }
  help() {
    this.#helpEnabled = true
  }
}

const cli = new Clif({ name: 'hello', description: 'Say Hello' })
cli.help()
cli.parse()
