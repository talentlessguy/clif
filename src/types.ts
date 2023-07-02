export type OptionType = 'boolean' | 'string' | 'number'

type ToLiteralType<T> = T extends 'string'
  ? string
  : T extends 'boolean'
  ? boolean
  : T extends 'number'
  ? number
  : never

export type Option<T extends OptionType = OptionType> = {
  type: T
  required?: boolean
  /**
   * Short command alias
   */
  alias?: string
}

export type Options = {
  [option: string]: Option<OptionType>
}

export type ParsedOptions<T extends Options = Options> = {
  [option in keyof T]: ToLiteralType<T[option]['type']>
}

export interface Command<
  Opts extends Options = Options,
  Args extends string[] = string[]
> {
  name?: string
  description?: string
  args?: Args
  options: Opts
  action: (args: Args, options: ParsedOptions<Opts>) => void
}