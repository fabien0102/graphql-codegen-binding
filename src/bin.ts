#!/usr/bin/env node

import * as yargs from 'yargs'
import * as fs from 'fs'
import { GraphQLEndpoint } from 'graphql-config'
import { generateCode } from '.'

const argv = yargs
  .usage(
    `Usage: $0 -s [schema] -e [endpoint] -h [headers] -g [generator] -t [target]`,
  )
  .options({
    schema: {
      alias: 's',
      describe: 'Path to schema.graphql file',
      type: 'string',
    },
    endpoint: {
      alias: 'e',
      describe: 'GraphQL endpoint to fetch schema from',
      type: 'string',
    },
    headers: {
      alias: 'h',
      describe: 'Header to use for downloading the schema (with endpoint URL)',
      type: 'string',
    },
    generator: {
      alias: 'g',
      describe:
        'Type of the generator. Available generators: typescript, javascript',
      type: 'string',
    },
    target: {
      alias: 't',
      describe: 'Target file. Example: schema.ts',
      type: 'string',
    },
  })
  .demandOption(['g', 't']).argv

run(argv)

async function run(argv) {
  if (!argv.schema && !argv.endpoint) {
    throw new Error(
      'Please either provide the schema or the endpoint you want to get the schema from.',
    )
  }

  const schema = argv.schema
    ? fs.readFileSync(argv.schema, 'utf-8')
    : await downloadFromEndpointUrl(argv)

  const code = generateCode(schema, argv.generator)
  fs.writeFileSync(argv.target, code)
  console.log('Done generating binding')
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
