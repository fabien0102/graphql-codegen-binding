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
  Main: renderMainMethod,
  Header: renderHeader,
}

function renderHeader(schema: string): string {
  return `const { Binding: BaseBinding } = require('graphql-binding')
const { GraphQLResolveInfo } = require('graphql')`
}

function renderMainMethodFields(
  operation: string,
  fields: GraphQLFieldMap<any, any>,
): string {
  return Object.keys(fields)
    .map(f => {
      const field = fields[f]
      return `      ${field.name}(args, info, context) { 
        return self.delegate('${operation}', '${
        field.name
      }', args, info, context)
      }`
    })
    .join(',\n')
}

function renderMainSubscriptionMethodFields(
  operation: string,
  fields: GraphQLFieldMap<any, any>,
): string {
  return Object.keys(fields)
    .map(f => {
      const field = fields[f]
      return `      ${field.name}(args, infoOrQuery, context) { 
        return self.delegateSubscription('${
          field.name
        }', args, infoOrQuery, context)
      }`
    })
    .join(',\n')
}

function renderMainMethod(
  queryType: GraphQLObjectType,
  mutationType?: GraphQLObjectType | null,
  subscriptionType?: GraphQLObjectType | null,
) {
  return `module.exports.Binding = class Binding extends BaseBinding {

  constructor({ schema, fragmentReplacements }) {
    super({ schema, fragmentReplacements });

    var self = this
    this.query = {
${renderMainMethodFields('query', queryType.getFields())}
    }${
      mutationType
        ? `
      
    this.mutation = {
${renderMainMethodFields('mutation', mutationType.getFields())}
    }`
        : ''
    }${
    subscriptionType
      ? `
      
    this.subscription = {
${renderMainSubscriptionMethodFields('mutation', subscriptionType.getFields())}
    }`
      : ''
  }
  }

  delegate(operation, field, args, info, context) {
    return super.delegate(operation, field, args, info, context)
  }

  delegateSubscription(field, args, infoOrQuery, context) {
    return super.delegateSubscription(field, args, infoOrQuery, context)
  }
}`
}
