import { DraftReviewSchema } from "../schemas/reviewSchema.js";

export const validateReviewOutput = (review: unknown) => {
  const result = DraftReviewSchema.safeParse(review);

  if (!result.success) {
    throw new Error("AI review output failed validation.");
  }

  return result.data;
};