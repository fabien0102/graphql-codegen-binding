import {
  GraphQLObjectType,
  GraphQLUnionType,
  GraphQLInputObjectType,
  GraphQLScalarType,
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLFieldMap,
} from 'graphql'

export interface Generator {
  Main: (
    queryType: GraphQLObjectType | void,
    mutationType?: GraphQLObjectType | null | void,
    subscriptionType?: GraphQLObjectType | null | void,
  ) => string
  Header: (schema: string) => string
  SchemaType?: (
    queryType: GraphQLObjectType | void,
    mutationType?: GraphQLObjectType | null | void,
    subscriptionType?: GraphQLObjectType | null | void,
  ) => string
  RootType?: (type: GraphQLObjectType | void) => string
  SubscriptionType?: (type: GraphQLObjectType | void) => string
  GraphQLUnionType?: (type: GraphQLUnionType) => string
  GraphQLInputObjectType?: (type: GraphQLInputObjectType) => string
  GraphQLObjectType?: (type: GraphQLObjectType) => string
  GraphQLScalarType?: (type: GraphQLScalarType) => string
  GraphQLEnumType?: (type: GraphQLEnumType) => string
  GraphQLInterfaceType?: (type: GraphQLInterfaceType) => string
  MainFields?: (operation: string, fields: GraphQLFieldMap<any, any>) => string
  MainSubscriptionFields?: (fields: GraphQLFieldMap<any, any>) => string
  TypeWrapper?: (
    typeName: string,
    typeDescription: string | void,
    fieldDefinition: string,
  ) => string
}
