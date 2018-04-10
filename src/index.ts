export { generateCode } from './generateCode'
export { makeBinding } from './makeBinding'

import { generator as typescriptGenerator } from './generators/typescript'
export { typescriptGenerator }
import { generator as javascriptGenerator } from './generators/javascript'
export { javascriptGenerator }
export { Generator } from './generators/types'
