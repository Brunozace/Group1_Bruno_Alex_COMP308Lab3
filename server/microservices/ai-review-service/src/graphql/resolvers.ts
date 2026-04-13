import { DraftReview } from "../models/DraftReview.js";
import { retrieveRelevantChunks } from "../services/retriever.js";
import { generateStructuredReview } from "../services/reviewGenerator.js";
import { reflectOnReview } from "../services/reflection.js";
import { validateReviewOutput } from "../services/validator.js";

interface GraphQLContext {
  req: {
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
  Query: {
    draftReview: async (_: unknown, args: { reviewId: string }, context: GraphQLContext) => {
      requireAuth(context);
      return await DraftReview.findById(args.reviewId);
    },

    reviewsByDraft: async (_: unknown, args: { draftId: string }, context: GraphQLContext) => {
      requireAuth(context);
      return await DraftReview.find({ draftId: args.draftId }).sort({ createdAt: -1 });
    }
  },

  Mutation: {
    reviewDraft: async (
      _: unknown,
      args: { draftId: string; content: string },
      context: GraphQLContext
    ) => {
      const userId = requireAuth(context);

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