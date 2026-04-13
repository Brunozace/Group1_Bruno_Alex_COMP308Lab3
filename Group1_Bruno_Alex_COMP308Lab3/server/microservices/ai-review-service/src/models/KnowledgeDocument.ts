import mongoose, { Schema, Document, Model } from "mongoose";

export interface IKnowledgeDocument extends Document {
  title: string;
  category: string;
  chunkId: string;
  content: string;
  embedding: number[];
}

const KnowledgeDocumentSchema = new Schema<IKnowledgeDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    chunkId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    embedding: {
      type: [Number],
      default: []
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

export const KnowledgeDocument: Model<IKnowledgeDocument> =
  mongoose.models.KnowledgeDocument ||
  mongoose.model<IKnowledgeDocument>("KnowledgeDocument", KnowledgeDocumentSchema);