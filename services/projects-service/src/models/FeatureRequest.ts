import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFeatureRequest extends Document {
  projectId: Types.ObjectId;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureRequestSchema = new Schema<IFeatureRequest>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Project",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "open",
      enum: ["open", "in progress", "completed"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const FeatureRequest: Model<IFeatureRequest> =
  mongoose.models.FeatureRequest ||
  mongoose.model<IFeatureRequest>("FeatureRequest", FeatureRequestSchema);