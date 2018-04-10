import * as fs from 'fs'
import { GraphQLEndpoint } from 'graphql-config'
import { makeBinding } from './makeBinding'
import { GeneratorType } from './types'

interface CodeGenerationInput {
  schema: string
  endpoint: string
  generator: GeneratorType
  target: string
  headers?: string
}

export async function generateCode(argv: CodeGenerationInput) {
  if (!argv.schema && !argv.endpoint) {
    throw new Error(
      'Please either provide the schema or the endpoint you want to get the schema from.',
    )
  }

  const schema = argv.schema
    ? fs.readFileSync(argv.schema, 'utf-8')
    : await downloadFromEndpointUrl(argv)

  const code = makeBinding(schema, argv.generator)
  fs.writeFileSync(argv.target, code)
}

function downloadFromEndpointUrl(argv) {
  const endpointHeaders = {}
  if (argv.headers) {
    const headers = Array.isArray(argv.headers) ? argv.headers : [argv.headers]
    Object.assign(
      endpointHeaders,
      ...headers.map(h => ({ [h.split('=')[0]]: h.split('=')[1] })),
    )
  }

  const endpoint = new GraphQLEndpoint({
    url: argv.endpoint,
    headers: endpointHeaders,
  })

  return endpoint.resolveSchemaSDL()
}
