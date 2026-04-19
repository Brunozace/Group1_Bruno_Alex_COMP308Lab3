import type { DraftReviewOutput } from "../schemas/reviewSchema.js";

export const reflectOnReview = async (
  review: DraftReviewOutput
): Promise<DraftReviewOutput> => {
  let changed = false;
  let confidenceAdjusted = false;
  const unsupportedClaims: string[] = [];
  const citationRevisions: string[] = [];

  const updatedIssues = review.issues.map((issue) => {
    const hasCitationSupport = issue.citations.length > 0;
    const weakCitationSupport =
      hasCitationSupport && issue.citations.every((citation) => citation.relevanceScore < 0.08);

    if (!hasCitationSupport || weakCitationSupport) {
      changed = true;
      confidenceAdjusted = true;
      unsupportedClaims.push(
        `${issue.type}: ${hasCitationSupport ? "only weak citation support" : "missing citations"}`
      );
      citationRevisions.push(
        `${issue.type}: confidence reduced during reflection because evidence support was insufficient.`
      );

      return {
        ...issue,
        confidenceScore: Math.max(0.3, issue.confidenceScore - (hasCitationSupport ? 0.12 : 0.22))
      };
    }

    return issue;
  });

  const updatedOverall =
    updatedIssues.length > 0
      ? updatedIssues.reduce((sum, issue) => sum + issue.confidenceScore, 0) / updatedIssues.length
      : review.overallConfidence;
  const finalConfidence = Number(updatedOverall.toFixed(4));

  return {
    ...review,
    issues: updatedIssues,
    finalConfidence,
    overallConfidence: finalConfidence,
    reflection: {
      changed,
      confidenceAdjusted,
      notes: changed
        ? "Reflection found unsupported or weakly supported claims and reduced confidence before persistence."
        : "Reflection confirmed that generated issues include citation support from retrieved knowledge chunks.",
      unsupportedClaims,
      citationRevisions
    }
  };
};
