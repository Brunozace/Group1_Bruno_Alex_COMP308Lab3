import { Draft } from "../models/Draft.js";
import { FeatureRequest } from "../models/FeatureRequest.js";
import { Project } from "../models/Project.js";

interface GraphQLContext {
  req: {
    session: {
      userId?: string;
    };
  };
}

const requireAuth = (context: GraphQLContext) => {
  if (!context.req.session.userId) {
    throw new Error("Not authenticated.");
  }
  return context.req.session.userId;
};

const normalizeDate = (value?: string | number | Date | null) => {
  if (!value) return null;

  const date =
    typeof value === "string" && /^\d+$/.test(value)
      ? new Date(Number(value))
      : typeof value === "number"
      ? new Date(value)
      : value instanceof Date
      ? value
      : new Date(String(value));

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const resolvers = {
  Project: {
    createdAt: (parent: { createdAt?: string | number | Date | null }) =>
      normalizeDate(parent.createdAt),
  },

  FeatureRequest: {
    createdAt: (parent: { createdAt?: string | number | Date | null }) =>
      normalizeDate(parent.createdAt),
  },

  Draft: {
    createdAt: (parent: { createdAt?: string | number | Date | null }) =>
      normalizeDate(parent.createdAt),
  },

  Query: {
    projectsByUser: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireAuth(context);
      return await Project.find({ owner: userId }).sort({ createdAt: -1 });
    },

    project: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const userId = requireAuth(context);
      return await Project.findOne({ _id: args.id, owner: userId });
    },

    featureRequests: async (
      _parent: unknown,
      args: { projectId: string },
      context: GraphQLContext
    ) => {
      const userId = requireAuth(context);

      const project = await Project.findOne({
        _id: args.projectId,
        owner: userId,
      });

      if (!project) {
        throw new Error("Project not found or unauthorized.");
      }

      return await FeatureRequest.find({ projectId: args.projectId }).sort({
        createdAt: -1,
      });
    },

    draftsByFeature: async (
      _parent: unknown,
      args: { featureId: string },
      context: GraphQLContext
    ) => {
      const userId = requireAuth(context);

      const feature = await FeatureRequest.findById(args.featureId);
      if (!feature) {
        throw new Error("Feature request not found.");
      }

      const project = await Project.findOne({
        _id: feature.projectId,
        owner: userId,
      });

      if (!project) {
        throw new Error("Unauthorized.");
      }

      return await Draft.find({ featureId: args.featureId }).sort({
        createdAt: -1,
      });
    },
  },

  Mutation: {
    createProject: async (
      _parent: unknown,
      args: { title: string; description: string },
      context: GraphQLContext
    ) => {
      const userId = requireAuth(context);

      return await Project.create({
        title: args.title,
        description: args.description,
        owner: userId,
      });
    },

    addFeatureRequest: async (
      _parent: unknown,
      args: { projectId: string; title: string; description: string },
      context: GraphQLContext
    ) => {
      const userId = requireAuth(context);

      const project = await Project.findOne({
        _id: args.projectId,
        owner: userId,
      });

      if (!project) {
        throw new Error("Project not found or unauthorized.");
      }

      return await FeatureRequest.create({
        projectId: args.projectId,
        title: args.title,
        description: args.description,
        status: "open",
      });
    },

    submitDraft: async (
      _parent: unknown,
      args: { featureId: string; content: string },
      context: GraphQLContext
    ) => {
      const userId = requireAuth(context);

      const feature = await FeatureRequest.findById(args.featureId);
      if (!feature) {
        throw new Error("Feature request not found.");
      }

      const project = await Project.findOne({
        _id: feature.projectId,
        owner: userId,
      });

      if (!project) {
        throw new Error("Unauthorized.");
      }

      const previousDraft = await Draft.findOne({ featureId: args.featureId }).sort({ version: -1 });

      const nextVersion = previousDraft ? previousDraft.version + 1 : 1;

      return await Draft.create({
        featureId: args.featureId,
        author: userId,
        content: args.content,
        version: nextVersion,
      });
    },
  },
};