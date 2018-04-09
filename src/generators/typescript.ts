import {
  GraphQLUnionType,
  GraphQLWrappingType,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLInputField,
  GraphQLField,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLNamedType,
  isNonNullType,
  isListType,
  GraphQLFieldMap,
  GraphQLEnumType,
  GraphQLType,
  GraphQLInterfaceType,
} from 'graphql'

import { Generator } from './types'

export const generator: Generator = {
  GraphQLUnionType: renderUnionType,
  GraphQLObjectType: renderObjectType,
  GraphQLInputObjectType: renderInputObjectType,
  GraphQLScalarType: renderScalarType,
  GraphQLEnumType: renderEnumType,
  GraphQLInterfaceType: renderObjectType,
  Main: renderMainMethod,
  RootType: renderRootType,
  SubscriptionType: renderSubscriptionType,
  Header: renderHeader,
}

const scalarMapping = {
  Int: 'number',
  String: 'string',
  ID: 'string | number',
  Float: 'number',
  Boolean: 'boolean',
}

function renderSubscriptionType(type: GraphQLObjectType): string {
  const fieldDefinition = Object.keys(type.getFields())
    .map(f => {
      const field = type.getFields()[f]
      return `  ${field.name}: (args: {${
        field.args.length > 0 ? ' ' : ''
      }${field.args
        .map(f => `${renderFieldName(f)}: ${renderFieldType(f.type)}`)
        .join(', ')}${
        field.args.length > 0 ? ' ' : ''
      }}, context: { [key: string]: any }, infoOrQuery?: GraphQLResolveInfo | string) => Promise<AsyncIterator<${renderFieldType(
        field.type,
      )}>>`
    })
    .join('\n')

  return renderTypeWrapper(type.name, type.description, fieldDefinition)
}

function renderHeader(schema: string): string {
  return `import { Binding as BaseBinding, BindingOptions } from 'graphql-binding'
import { GraphQLResolveInfo } from 'graphql'`
}

function renderMainMethod(
  queryType: GraphQLObjectType,
  mutationType?: GraphQLObjectType | null,
  subscriptionType?: GraphQLObjectType | null,
) {
  return `export class Binding extends BaseBinding {

constructor({ schema, fragmentReplacements }: BindingOptions) {
  super({ schema, fragmentReplacements });
}

query: Query = {
${renderMainMethodFields('query', queryType.getFields())}
}${
    mutationType
      ? `

mutation: Mutation = {
${renderMainMethodFields('mutation', mutationType.getFields())}
}`
      : ''
  }${
    subscriptionType
      ? `

subscription: Subscription = {
${renderMainSubscriptionMethodFields(subscriptionType.getFields())}
}`
      : ''
  }
}`
}

function renderRootType(type: GraphQLObjectType): string {
  const fieldDefinition = Object.keys(type.getFields())
    .map(f => {
      const field = type.getFields()[f]
      return `  ${field.name}: (args: {${
        field.args.length > 0 ? ' ' : ''
      }${field.args
        .map(f => `${renderFieldName(f)}: ${renderFieldType(f.type)}`)
        .join(', ')}${
        field.args.length > 0 ? ' ' : ''
      }}, context: { [key: string]: any }, info?: GraphQLResolveInfo | string) => Promise<${renderFieldType(
        field.type,
      )}${!isNonNullType(field.type) ? ' | null' : ''}>`
    })
    .join('\n')

  return renderTypeWrapper(type.name, type.description, fieldDefinition)
}

export function renderMainMethodFields(
  operation: string,
  fields: GraphQLFieldMap<any, any>,
): string {
  return Object.keys(fields)
    .map(f => {
      const field = fields[f]
      return `    ${
        field.name
      }: (args, context, info): Promise<${renderFieldType(field.type)}${
        !isNonNullType(field.type) ? ' | null' : ''
      }> => super.delegate('${operation}', '${
        field.name
      }', args, context, info)`
    })
    .join(',\n')
}

export function renderMainSubscriptionMethodFields(
  fields: GraphQLFieldMap<any, any>,
): string {
  return Object.keys(fields)
    .map(f => {
      const field = fields[f]
      return `    ${
        field.name
      }: (args, context, infoOrQuery): Promise<AsyncIterator<${renderFieldType(
        field.type,
      )}>> => super.delegateSubscription('${
        field.name
      }', args, context, infoOrQuery)`
    })
    .join(',\n')
}
function renderUnionType(type: GraphQLUnionType): string {
  return `${renderDescription(type.description)}export type ${
    type.name
  } = ${type
    .getTypes()
    .map(t => t.name)
    .join(' | ')}`
}

function renderObjectType(
  type: GraphQLObjectType | GraphQLInputObjectType | GraphQLInterfaceType,
): string {
  const fieldDefinition = Object.keys(type.getFields())
    .map(f => {
      const field = type.getFields()[f]
      return `  ${renderFieldName(field)}: ${renderFieldType(field.type)}`
    })
    .join('\n')

  let interfaces: GraphQLInterfaceType[] = []
  if (type instanceof GraphQLObjectType) {
    interfaces = type.getInterfaces()
  }

  return renderInterfaceWrapper(
    type.name,
    type.description,
    interfaces,
    fieldDefinition,
  )
}

function renderInputObjectType(
  type: GraphQLObjectType | GraphQLInputObjectType | GraphQLInterfaceType,
): string {
  const fieldDefinition = Object.keys(type.getFields())
    .map(f => {
      const field = type.getFields()[f]
      return `  ${renderFieldName(field)}: ${renderInputFieldType(field.type)}`
    })
    .join('\n')

  let interfaces: GraphQLInterfaceType[] = []
  if (type instanceof GraphQLObjectType) {
    interfaces = type.getInterfaces()
  }

  return renderInterfaceWrapper(
    type.name,
    type.description,
    interfaces,
    fieldDefinition,
  )
}

export function renderFieldName(
  field: GraphQLInputField | GraphQLField<any, any>,
) {
  return `${field.name}${isNonNullType(field.type) ? '' : '?'}`
}

export function renderFieldType(type: GraphQLInputType | GraphQLOutputType) {
  if (isNonNullType(type)) {
    return renderFieldType((type as GraphQLWrappingType).ofType)
  }
  if (isListType(type)) {
    return `${renderFieldType((type as GraphQLWrappingType).ofType)}[]`
  }
  return `${(type as GraphQLNamedType).name}${
    (type as GraphQLNamedType).name === 'ID' ? '_Output' : ''
  }`
}

function renderInputFieldType(type: GraphQLInputType | GraphQLOutputType) {
  if (isNonNullType(type)) {
    return renderInputFieldType((type as GraphQLWrappingType).ofType)
  }
  if (isListType(type)) {
    const inputType = renderInputFieldType((type as GraphQLWrappingType).ofType)
    return `${inputType}[] | ${inputType}`
  }
  return `${(type as GraphQLNamedType).name}${
    (type as GraphQLNamedType).name === 'ID' ? '_Input' : ''
  }`
}

function renderScalarType(type: GraphQLScalarType): string {
  if (type.name === 'ID') {
    return renderIDType(type)
  }
  return `${
    type.description
      ? `/*
${type.description}
*/
`
      : ''
  }export type ${type.name} = ${scalarMapping[type.name] || 'string'}`
}

function renderIDType(type: GraphQLScalarType): string {
  return `${
    type.description
      ? `/*
${type.description}
*/
`
      : ''
  }export type ${type.name}_Input = ${scalarMapping[type.name] || 'string'}
export type ${type.name}_Output = string`
}

function renderEnumType(type: GraphQLEnumType): string {
  return `${renderDescription(type.description)}export type ${type.name} = 
${type
    .getValues()
    .map(e => `  '${e.name}'`)
    .join(' |\n')}`
}

function renderInterfaceWrapper(
  typeName: string,
  typeDescription: string | void,
  interfaces: GraphQLInterfaceType[],
  fieldDefinition: string,
): string {
  return `${renderDescription(typeDescription)}export interface ${typeName}${
    interfaces.length > 0
      ? ` extends ${interfaces.map(i => i.name).join(', ')}`
      : ''
  } {
${fieldDefinition}
}`
}

export function renderTypeWrapper(
  typeName: string,
  typeDescription: string | void,
  fieldDefinition: string,
): string {
  return `${renderDescription(typeDescription)}export type ${typeName} = {
${fieldDefinition}
}`
}

function renderDescription(description?: string | void) {
  return `${
    description
      ? `/*
${description.split('\n').map(l => ` * ${l}\n`)}
 */
`
      : ''
  }`
}
