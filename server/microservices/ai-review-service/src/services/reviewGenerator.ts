import type { DraftReviewOutput } from "../schemas/reviewSchema.js";

export const generateStructuredReview = async (
  content: string,
  retrievedDocs: Array<{
    title: string;
    chunkId: string;
    content: string;
  }>
): Promise<DraftReviewOutput> => {
  const citations = retrievedDocs.map((doc) => ({
    documentName: doc.title,
    chunkId: doc.chunkId,
    excerpt: doc.content.slice(0, 180)
  }));

  const issues: DraftReviewOutput["issues"] = [];

  if (content.toLowerCase().includes("resolver") && !content.toLowerCase().includes("auth")) {
    issues.push({
      type: "security",
      severity: "high",
      description: "The draft may be missing clear authorization checks for protected resolver logic.",
      suggestions: [
        "Verify the user session before executing protected resolver actions.",
        "Restrict access based on the logged-in user where appropriate."
      ],
      confidenceScore: 0.8,
      citations: citations.slice(0, 2)
    });
  }

  if (!content.toLowerCase().includes("error")) {
    issues.push({
      type: "reliability",
      severity: "medium",
      description: "The draft does not clearly explain error handling or validation paths.",
      suggestions: [
        "Add explicit input validation.",
        "Return safe and consistent error messages for failure cases."
      ],
      confidenceScore: 0.72,
      citations: citations.slice(0, 2)
    });
  }

  if (!content.toLowerCase().includes("test")) {
    issues.push({
      type: "quality",
      severity: "low",
      description: "The draft does not mention testing or verification steps.",
      suggestions: [
        "Describe how the feature will be tested.",
        "Add unit or integration test coverage where possible."
      ],
      confidenceScore: 0.65,
      citations: citations.slice(0, 1)
    });
  }

  return {
    summary:
      issues.length > 0
        ? "The draft is promising but there are review concerns related to implementation quality, safety, or completeness."
        : "The draft appears reasonably aligned with the retrieved guidance.",
    issues,
    overallConfidence: issues.length > 0 ? 0.74 : 0.88,
    citations,
    reflection: {
      changed: false,
      notes: "Initial structured review generated from retrieved knowledge documents.",
      confidenceAdjusted: false
    }
  };
};