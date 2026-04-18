import mongoose, { Schema, Document, Model } from "mongoose";

interface ICitation {
  documentName: string;
  category: string;
  section: string;
  chunkId: string;
  excerpt: string;
  relevanceScore: number;
}

interface IReviewIssue {
  type: string;
  severity: string;
  description: string;
  suggestions: string[];
  confidenceScore: number;
  citations: ICitation[];
}

interface IReflectionInfo {
  changed: boolean;
  notes?: string;
  confidenceAdjusted: boolean;
  unsupportedClaims: string[];
  citationRevisions: string[];
}

export interface IDraftReview extends Document {
  draftId: string;
  reviewedBy: string;
  summary: string;
  issues: IReviewIssue[];
  initialConfidence: number;
  finalConfidence: number;
  overallConfidence: number;
  citations: ICitation[];
  reflection: IReflectionInfo;
  createdAt: Date;
}

const CitationSchema = new Schema<ICitation>(
  {
    documentName: { type: String, required: true },
    category: { type: String, required: true },
    section: { type: String, required: true },
    chunkId: { type: String, required: true },
    excerpt: { type: String, required: true },
    relevanceScore: { type: Number, required: true }
  },
  { _id: false }
);

const ReviewIssueSchema = new Schema<IReviewIssue>(
  {
    type: { type: String, required: true },
    severity: { type: String, required: true },
    description: { type: String, required: true },
    suggestions: [{ type: String, required: true }],
    confidenceScore: { type: Number, required: true },
    citations: [CitationSchema]
  },
  { _id: false }
);

const ReflectionSchema = new Schema<IReflectionInfo>(
  {
    changed: { type: Boolean, required: true },
    notes: { type: String },
    confidenceAdjusted: { type: Boolean, required: true },
    unsupportedClaims: [{ type: String, required: true }],
    citationRevisions: [{ type: String, required: true }]
  },
  { _id: false }
);

const DraftReviewSchema = new Schema<IDraftReview>(
  {
    draftId: {
      type: String,
      required: true,
      index: true
    },
    reviewedBy: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      required: true
    },
    issues: [ReviewIssueSchema],
    initialConfidence: {
      type: Number,
      required: true
    },
    finalConfidence: {
      type: Number,
      required: true
    },
    overallConfidence: {
      type: Number,
      required: true
    },
    citations: [CitationSchema],
    reflection: {
      type: ReflectionSchema,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
  }
);

export const DraftReview: Model<IDraftReview> =
  mongoose.models.DraftReview ||
  mongoose.model<IDraftReview>("DraftReview", DraftReviewSchema);
