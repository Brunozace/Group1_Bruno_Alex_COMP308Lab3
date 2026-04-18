import { z } from "zod";

export const CitationSchema = z.object({
  documentName: z.string().min(1),
  category: z.string().min(1),
  section: z.string().min(1),
  chunkId: z.string().min(1),
  excerpt: z.string().min(1),
  relevanceScore: z.number().min(0).max(1)
});

export const ReviewIssueSchema = z.object({
  type: z.string(),
  severity: z.string(),
  description: z.string(),
  suggestions: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
  citations: z.array(CitationSchema)
});

export const DraftReviewSchema = z.object({
  summary: z.string().min(1),
  issues: z.array(ReviewIssueSchema),
  initialConfidence: z.number().min(0).max(1),
  finalConfidence: z.number().min(0).max(1),
  overallConfidence: z.number().min(0).max(1),
  citations: z.array(CitationSchema),
  reflection: z.object({
    changed: z.boolean(),
    notes: z.string().optional(),
    confidenceAdjusted: z.boolean(),
    unsupportedClaims: z.array(z.string()),
    citationRevisions: z.array(z.string())
  })
});

export type DraftReviewOutput = z.infer<typeof DraftReviewSchema>;
