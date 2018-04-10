import {
  DocumentNode,
  Kind,
  ObjectTypeDefinitionNode,
  OperationTypeDefinitionNode,
  parse,
} from 'graphql'
import { GraphQLSchema } from 'graphql/type/schema'
import { buildASTSchema } from 'graphql/utilities/buildASTSchema'
import { generators } from './generators'
import { GeneratorType } from './types'

/**
 * The schema contains incompatible characters sometimes, e.g.
 * data types in comments are emphasized with "`", which represents
 * template strings in ES2015 and TypeScript. This function
 * replaces those characters with sane defaults.
 *
 * @param schema {String} The serialized schema
 * @returns {String}
 *
 */
const sanitizeSchema = (schema: string) => schema.replace(/\`/g, "'")

export function makeBinding(
  schema: string,
  generatorName: GeneratorType,
): string {
  const generator =
    generators[generatorName] || require(generatorName).generator
  if (!generator) {
    throw new Error(`Generator '${generator}' could not be found. Available generators:
${Object.keys(generators)
      .map(k => `'${k}`)
      .join(', ')}`)
  }

  schema = sanitizeSchema(schema)

  const document: DocumentNode = parse(schema, { noLocation: true })
  const ast: GraphQLSchema = buildASTSchema(document)

  // Create types
  const typeNames = Object.keys(ast.getTypeMap())
    .filter(typeName => !typeName.startsWith('__'))
    .filter(typeName => typeName !== (ast.getQueryType() as any).name)
    .filter(
      typeName =>
        ast.getMutationType()
          ? typeName !== (ast.getMutationType()! as any).name
          : true,
    )
    .filter(
      typeName =>
        ast.getSubscriptionType()
          ? typeName !== (ast.getSubscriptionType()! as any).name
          : true,
    )
    .sort(
      (a, b) =>
        (ast.getType(a) as any).constructor.name <
        (ast.getType(b) as any).constructor.name
          ? -1
          : 1,
    )

  // Special case 4: header
  const generatedClass = [generator.Header(schema)]

  // Process all types
  generatedClass.push(
    ...typeNames.map(typeName => {
      const type = ast.getTypeMap()[typeName]
      return generator[type.constructor.name]
        ? generator[type.constructor.name](type)
        : null
    }),
  )

  // Special case 1: generate schema interface
  if (generator.SchemaType) {
    generatedClass.push(
      generator.SchemaType(
        ast.getQueryType(),
        ast.getMutationType(),
        ast.getSubscriptionType(),
      ),
    )
  }

  // Special case 2: generate root field interfaces
  if (generator.RootType) {
    generatedClass.push(generator.RootType(ast.getQueryType()))
    if (ast.getMutationType()) {
      generatedClass.push(generator.RootType(ast.getMutationType()!))
    }
  }

  // Special case 5: subscription type
  if (generator.SubscriptionType) {
    if (ast.getSubscriptionType()) {
      generatedClass.push(
        generator.SubscriptionType(ast.getSubscriptionType()!),
      )
    }
  }

  // Special case 3: the main method
  generatedClass.push(
    generator.Main(
      ast.getQueryType(),
      ast.getMutationType(),
      ast.getSubscriptionType(),
    ),
  )

  return generatedClass.filter(r => r).join('\n\n')
}
