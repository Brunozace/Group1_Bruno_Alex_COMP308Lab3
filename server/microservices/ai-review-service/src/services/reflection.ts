import type { DraftReviewOutput } from "../schemas/reviewSchema.js";

export const reflectOnReview = async (
  review: DraftReviewOutput
): Promise<DraftReviewOutput> => {
  let changed = false;
  let confidenceAdjusted = false;

  const updatedIssues = review.issues.map((issue) => {
    if (!issue.citations.length) {
      changed = true;
      confidenceAdjusted = true;

      return {
        ...issue,
        confidenceScore: Math.max(0.3, issue.confidenceScore - 0.2)
      };
    }

    return issue;
  });

  const updatedOverall =
    updatedIssues.length > 0
      ? updatedIssues.reduce((sum, issue) => sum + issue.confidenceScore, 0) / updatedIssues.length
      : review.overallConfidence;

  return {
    ...review,
    issues: updatedIssues,
    overallConfidence: updatedOverall,
    reflection: {
      changed,
      confidenceAdjusted,
      notes: changed
        ? "Reflection found weak support for one or more claims, so confidence was reduced."
        : "Reflection confirmed that the main issues have citation support."
    }
  };
};