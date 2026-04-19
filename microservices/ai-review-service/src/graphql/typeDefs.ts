import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Citation {
    documentName: String!
    category: String!
    section: String!
    chunkId: String!
    excerpt: String!
    relevanceScore: Float!
  }

  type ReviewIssue {
    type: String!
    severity: String!
    description: String!
    suggestions: [String!]!
    confidenceScore: Float!
    citations: [Citation!]!
  }

  type ReflectionInfo {
    changed: Boolean!
    notes: String
    confidenceAdjusted: Boolean!
    unsupportedClaims: [String!]!
    citationRevisions: [String!]!
  }

  type DraftReview {
    id: ID!
    draftId: String!
    reviewedBy: String!
    summary: String!
    issues: [ReviewIssue!]!
    initialConfidence: Float!
    finalConfidence: Float!
    overallConfidence: Float!
    citations: [Citation!]!
    reflection: ReflectionInfo!
    createdAt: String!
  }

  extend type Query {
    draftReview(reviewId: ID!): DraftReview
    reviewsByDraft(draftId: String!): [DraftReview!]!
  }

  extend type Mutation {
    reviewDraft(draftId: String!, content: String!): DraftReview!
  }
`;
