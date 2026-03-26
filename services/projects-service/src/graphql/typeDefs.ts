import gql from "graphql-tag";

export const typeDefs = gql`
  type Project {
    id: ID!
    title: String!
    description: String!
    owner: ID!
    createdAt: String!
    updatedAt: String!
  }

  type FeatureRequest {
    id: ID!
    projectId: ID!
    title: String!
    description: String!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type Draft {
    id: ID!
    featureId: ID!
    author: ID!
    content: String!
    version: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    projectsByUser: [Project!]!
    project(id: ID!): Project
    featureRequests(projectId: ID!): [FeatureRequest!]!
    draftsByFeature(featureId: ID!): [Draft!]!
  }

  type Mutation {
    createProject(title: String!, description: String!): Project!
    addFeatureRequest(projectId: ID!, title: String!, description: String!): FeatureRequest!
    submitDraft(featureId: ID!, content: String!): Draft!
  }
`;