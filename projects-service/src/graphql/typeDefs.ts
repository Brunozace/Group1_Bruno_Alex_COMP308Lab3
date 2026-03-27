import {gql} from "graphql-tag";

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
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    projects: [Project]
    project(id: ID!): Project
    featureRequests(projectId: ID!): [FeatureRequest]
    drafts(featureId: ID!): [Draft]
  }

  type Mutation {
    createProject(title: String!, description: String!, owner: ID!): Project
    createFeatureRequest(projectId: ID!, title: String!, description: String!): FeatureRequest
    createDraft(featureId: ID!, author: ID!, content: String!): Draft
  }
`;