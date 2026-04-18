import { DraftReview } from "../models/DraftReview.js";
import { retrieveRelevantChunks } from "../services/retriever.js";
import { generateStructuredReview } from "../services/reviewGenerator.js";
import { reflectOnReview } from "../services/reflection.js";
import { validateReviewOutput } from "../services/validator.js";
import { assertDraftAccess } from "../services/draftAuthorization.js";

interface GraphQLContext {
  req: {
    headers?: {
      cookie?: string;
    };
    session: {
      userId?: string;
    };
  };
}

const requireAuth = (context: GraphQLContext) => {
  if (!context.req.session.userId) {
    throw new Error("Not authenticated.");
  }
  return context.req.session.userId;
};

export const resolvers = {
  Citation: {
    category: (parent: { category?: string }) => parent.category || "legacy",
    section: (parent: { section?: string }) => parent.section || "Unspecified section",
    relevanceScore: (parent: { relevanceScore?: number }) => parent.relevanceScore ?? 0
  },

  ReflectionInfo: {
    unsupportedClaims: (parent: { unsupportedClaims?: string[] }) => parent.unsupportedClaims || [],
    citationRevisions: (parent: { citationRevisions?: string[] }) => parent.citationRevisions || []
  },

  DraftReview: {
    initialConfidence: (parent: { initialConfidence?: number; overallConfidence?: number }) =>
      parent.initialConfidence ?? parent.overallConfidence ?? 0,
    finalConfidence: (parent: { finalConfidence?: number; overallConfidence?: number }) =>
      parent.finalConfidence ?? parent.overallConfidence ?? 0
  },

  Query: {
    draftReview: async (_: unknown, args: { reviewId: string }, context: GraphQLContext) => {
      const userId = requireAuth(context);
      return await DraftReview.findOne({ _id: args.reviewId, reviewedBy: userId });
    },

    reviewsByDraft: async (_: unknown, args: { draftId: string }, context: GraphQLContext) => {
      const userId = requireAuth(context);
      await assertDraftAccess(args.draftId, context);
      return await DraftReview.find({ draftId: args.draftId, reviewedBy: userId }).sort({ createdAt: -1 });
    }
  },

  Mutation: {
    reviewDraft: async (
      _: unknown,
      args: { draftId: string; content: string },
      context: GraphQLContext
    ) => {
      const userId = requireAuth(context);
      await assertDraftAccess(args.draftId, context);

      const retrievedDocs = await retrieveRelevantChunks(args.content);
      const initialReview = await generateStructuredReview(args.content, retrievedDocs);
      const reflectedReview = await reflectOnReview(initialReview);
      const validated = validateReviewOutput(reflectedReview);

      const saved = await DraftReview.create({
        draftId: args.draftId,
        reviewedBy: userId,
        ...validated
      });

      return saved;
    }
  }
};
