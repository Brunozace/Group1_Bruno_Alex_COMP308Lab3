import type { DraftReviewOutput } from "../schemas/reviewSchema.js";
import type { RetrievedChunk } from "./retriever.js";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const probabilisticConfidence = (base: number) => clamp(base + (Math.random() - 0.5) * 0.08);

const makeCitation = (doc: RetrievedChunk) => ({
  documentName: doc.title,
  category: doc.category,
  section: doc.section,
  chunkId: doc.chunkId,
  excerpt: doc.content.slice(0, 220),
  relevanceScore: doc.relevanceScore
});

const findDocs = (docs: RetrievedChunk[], categories: string[], fallbackCount = 2) => {
  const selected = docs.filter((doc) => categories.includes(doc.category)).slice(0, fallbackCount);
  return selected.length ? selected : docs.slice(0, fallbackCount);
};

export const generateStructuredReview = async (
  content: string,
  retrievedDocs: RetrievedChunk[]
): Promise<DraftReviewOutput> => {
  const citations = retrievedDocs.map(makeCitation);
  const normalized = content.toLowerCase();

  const issues: DraftReviewOutput["issues"] = [];

  if (
    (normalized.includes("resolver") || normalized.includes("mutation") || normalized.includes("query")) &&
    !/(auth|session|owner|authorized|authorization|permission)/.test(normalized)
  ) {
    const issueCitations = findDocs(retrievedDocs, ["security", "architecture"]).map(makeCitation);
    issues.push({
      type: "security",
      severity: "high",
      description:
        "The draft describes resolver or mutation logic without clearly scoping access to the authenticated user.",
      suggestions: [
        "Read the current session before executing protected resolver logic.",
        "Filter project, feature, and draft records by owner or membership before returning or mutating them.",
        "Avoid trusting client-provided ids without an ownership check."
      ],
      confidenceScore: probabilisticConfidence(0.82),
      citations: issueCitations
    });
  }

  if (!/(validate|validation|zod|invalid|required|error|try|catch)/.test(normalized)) {
    const issueCitations = findDocs(retrievedDocs, ["reliability", "quality"]).map(makeCitation);
    issues.push({
      type: "reliability",
      severity: "medium",
      description:
        "The draft does not identify validation rules or safe error handling for malformed input and failure paths.",
      suggestions: [
        "Define validation checks for required fields, expected values, and ownership assumptions.",
        "Return consistent user-safe error messages from failed resolver paths.",
        "Avoid saving generated or user-provided data until validation has passed."
      ],
      confidenceScore: probabilisticConfidence(0.74),
      citations: issueCitations
    });
  }

  if (!/(test|spec|verify|coverage|manual qa|integration)/.test(normalized)) {
    const issueCitations = findDocs(retrievedDocs, ["quality"]).map(makeCitation);
    issues.push({
      type: "quality",
      severity: "low",
      description: "The draft does not mention testing or verification steps.",
      suggestions: [
        "Add unit or integration tests for the main success path.",
        "Verify authorization, validation, and error paths.",
        "Document a manual verification path for the demo if automated tests are not yet available."
      ],
      confidenceScore: probabilisticConfidence(0.66),
      citations: issueCitations
    });
  }

  if (
    /(cookie|session|login|logout|credential|password)/.test(normalized) &&
    !/(httponly|http-only|server-side|connect-mongo|mongostore)/.test(normalized)
  ) {
    const issueCitations = findDocs(retrievedDocs, ["security"]).map(makeCitation);
    issues.push({
      type: "security",
      severity: "medium",
      description:
        "The draft references authentication or session behavior without documenting HTTP-only cookie and server-side session handling.",
      suggestions: [
        "State that authentication state is carried by HTTP-only cookies.",
        "Use the shared Mongo-backed session store across gateway-backed subgraphs.",
        "Avoid localStorage or token-based persistence for authentication state."
      ],
      confidenceScore: probabilisticConfidence(0.77),
      citations: issueCitations
    });
  }

  if (/(database|mongo|findbyid|_id|id)/.test(normalized) && !/(owner|author|membership|scope|filter)/.test(normalized)) {
    const issueCitations = findDocs(retrievedDocs, ["security", "data"]).map(makeCitation);
    issues.push({
      type: "data-access",
      severity: "high",
      description:
        "The draft appears to use identifiers or database access without describing ownership-scoped queries.",
      suggestions: [
        "Include the logged-in user's owner or author id in database filters.",
        "Reject access when a parent project or feature is not owned by the active user.",
        "Keep review history tied to the exact draft version."
      ],
      confidenceScore: probabilisticConfidence(0.79),
      citations: issueCitations
    });
  }

  const averageIssueConfidence =
    issues.length > 0
      ? issues.reduce((sum, issue) => sum + issue.confidenceScore, 0) / issues.length
      : probabilisticConfidence(0.88);

  return {
    summary:
      issues.length > 0
        ? `The draft is reviewable, but the retrieval-grounded pass found ${issues.length} concern${
            issues.length === 1 ? "" : "s"
          } related to safety, reliability, data access, or verification.`
        : "The draft appears aligned with the retrieved engineering guidance and has no major flagged issues.",
    issues,
    initialConfidence: averageIssueConfidence,
    finalConfidence: averageIssueConfidence,
    overallConfidence: averageIssueConfidence,
    citations,
    reflection: {
      changed: false,
      notes: "Initial structured review generated from retrieved knowledge documents.",
      confidenceAdjusted: false,
      unsupportedClaims: [],
      citationRevisions: []
    }
  };
};
