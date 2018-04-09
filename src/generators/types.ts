import {
  GraphQLObjectType,
  GraphQLUnionType,
  GraphQLInputObjectType,
  GraphQLScalarType,
  GraphQLEnumType,
  GraphQLInterfaceType,
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
}
