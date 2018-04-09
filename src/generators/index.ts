import { generator as typescriptGenerator } from './typescript'
import { generator as javascriptGenerator } from './javascript'
import { Generator } from './types'

export const generators: { [key: string]: Generator } = {
  typescript: typescriptGenerator,
  javascript: javascriptGenerator,
}
