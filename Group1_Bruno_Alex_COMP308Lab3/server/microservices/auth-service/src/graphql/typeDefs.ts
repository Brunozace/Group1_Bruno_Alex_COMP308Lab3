import {gql} from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    createdAt: String!
  }

  type AuthPayload {
    success: Boolean!
    message: String!
    user: User
  }

  type Query {
    currentUser: User
  }

  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      role: String
    ): AuthPayload!

    login(email: String!, password: String!): AuthPayload!

    logout: AuthPayload!
  }
`;