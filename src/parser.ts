import type {
  Option,
  OptionsWithNames,
  Options,
  ParsedOptions,
  ParserConfig,
} from './types.js'

const isOption = (x: string) => x.startsWith('-') || x.startsWith('--')

const findOptionInFlags = (options: OptionsWithNames, arg: string) =>
  options.find((x) => {
    return arg.includes('=')
      ? arg.startsWith(`--${x.name}`) || arg.startsWith(`-${x.alias}`)
      : arg === `--${x.name}` || arg === `-${x.alias}`
  })

const findFlagsWithOptions = (
  _argv: string[],
  optionsWithAliases: OptionsWithNames
) => {
  let argv = _argv
  const options: Record<string, string | number | boolean> = {}
  const unknownOptions: string[] = []
  const positionals: string[] = []

  while (argv.length !== 0) {
    let arg = argv[0]
    console.log()
    const option = findOptionInFlags(optionsWithAliases, arg)
    const argPosition = argv.indexOf(arg)
    if (option) {
      let optionValue: string | undefined

      if (arg.includes('=')) {
        const [newArg, value] = arg.split('=')
        arg = newArg
        optionValue = value
        argv.splice(argPosition, 1)
      } else {
        if (option.type !== 'boolean') {
          optionValue = argv[argPosition + 1]
          argv.splice(argPosition, 2)
        } else {
          argv.splice(argPosition, 1)
        }
      }
      if (option.type === 'boolean') {
        if (optionValue)
          throw new Error(`Option "${arg}" does not accept parameters.`)
        options[option.name] = true
        continue
      }

      if (!optionValue || isOption(optionValue))
        throw new Error(`Option "${arg}" requires a parameter.`)
      if (option.type === 'number') {
        const n = parseInt(optionValue)
        if (isNaN(n))
          throw new Error(`Expected option "${arg}" parameter to be a number.`)
        options[option.name] = n
        continue
      }
      options[option.name] = optionValue
      continue
    } else {
      if (arg === '--') {
        continue
      } else if (arg.startsWith('-') || arg.startsWith('--')) {
        unknownOptions.push(arg)
      } else {
        positionals.push(arg)
      }
      argv.splice(argPosition, 1)
    }
  }

  return { options, unknownOptions, positionals }
}

export const parseArgv = (
  options: Options = {},
  argv: string[],
  config: ParserConfig = { strict: false }
) => {
  const entries: OptionsWithNames = Object.entries(options).map(([k, v]) => ({
    name: k,
    ...v,
  }))

  const { unknownOptions, ...parsed } = findFlagsWithOptions(argv, entries)

  if (config.strict && unknownOptions.length !== 0)
    throw new Error(`Unknown option "${unknownOptions[0]}"`)

  return { unknownOptions, ...parsed }
}

export const baseOptions = (
  argv: string[],
  options?: Options,
  config: ParserConfig = { strict: false }
) =>
  parseArgv(
    {
      help: {
        type: 'boolean',
        alias: 'h',
      },
      version: {
        type: 'boolean',
        alias: 'v',
      },
      ...options,
    },
    argv,
    config
  )
