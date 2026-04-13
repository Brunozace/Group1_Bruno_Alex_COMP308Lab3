import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDraft extends Document {
  featureId: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const DraftSchema = new Schema<IDraft>(
  {
    featureId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "FeatureRequest",
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Draft: Model<IDraft> =
  mongoose.models.Draft || mongoose.model<IDraft>("Draft", DraftSchema);