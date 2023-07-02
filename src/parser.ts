import { Option, Options, ParsedOptions } from './types.js'

const isOption = (x: string) => x.startsWith('-') || x.startsWith('--')

const findOption = (argv: string[], option: string, alias?: string) =>
  argv.find((arg) =>
    [`--${option}`, alias ? `-${alias}` : ''].find((option) => arg == option)
  )

const getOptionValue = (
  argv: string[],
  option: Option,
  flag: string,
  name: string
): true | number | string => {
  if (option.type === 'boolean') return true

  const pos = argv.indexOf(flag)
  if (!argv[pos + 1] || isOption(argv[pos + 1]))
    throw new Error(`Option "${name}" requires a parameter.`)
  if (option.type === 'number') {
    const n = parseInt(argv[pos + 1])
    if (isNaN(n))
      throw new Error(`Expected option "${name}" value to be a number.`)
    return n
  }
  return argv[pos + 1]
}

export const parseArgv = (options: Options = {}, argv: string[]) => {
  const parsed: ParsedOptions<typeof options> = {}
  for (const [name, opt] of Object.entries(options)) {
    const flag = findOption(argv, name, opt.alias)
    if (opt.required && !flag) throw new Error(`Option "${name}" is required.`)
    if (flag) parsed[name] = getOptionValue(argv, opt, flag, name)
  }
  return parsed
}

export const baseOptions = (argv: string[], options?: Options) =>
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
    argv
  )
