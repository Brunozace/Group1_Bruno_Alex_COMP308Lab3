import { z } from "zod";

export const CitationSchema = z.object({
  documentName: z.string(),
  chunkId: z.string(),
  excerpt: z.string()
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
  summary: z.string(),
  issues: z.array(ReviewIssueSchema),
  overallConfidence: z.number().min(0).max(1),
  citations: z.array(CitationSchema),
  reflection: z.object({
    changed: z.boolean(),
    notes: z.string().optional(),
    confidenceAdjusted: z.boolean()
  })
});

export type DraftReviewOutput = z.infer<typeof DraftReviewSchema>;