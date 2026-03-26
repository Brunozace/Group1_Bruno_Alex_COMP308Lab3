import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

interface GraphQLContext {
  req: {
    session: {
      userId?: string;
      destroy: (callback: (err?: Error | null) => void) => void;
    };
  };
  res: {
    clearCookie: (name: string) => void;
  };
}

export const resolvers = {
  Query: {
    currentUser: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.req.session.userId) return null;
      return await User.findById(context.req.session.userId);
    },
  },

  Mutation: {
    register: async (
      _parent: unknown,
      args: { username: string; email: string; password: string; role?: string },
      context: GraphQLContext
    ) => {
      const { username, email, password, role } = args;

      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser) {
        return {
          success: false,
          message: "Username or email already exists.",
          user: null,
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role: role || "developer",
      });

      context.req.session.userId = user._id.toString();

      return {
        success: true,
        message: "Registration successful.",
        user,
      };
    },

    login: async (
      _parent: unknown,
      args: { email: string; password: string },
      context: GraphQLContext
    ) => {
      const { email, password } = args;

      const user = await User.findOne({ email });
      if (!user) {
        return {
          success: false,
          message: "Invalid email or password.",
          user: null,
        };
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return {
          success: false,
          message: "Invalid email or password.",
          user: null,
        };
      }

      context.req.session.userId = user._id.toString();

      return {
        success: true,
        message: "Login successful.",
        user,
      };
    },

    logout: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      return await new Promise((resolve) => {
        context.req.session.destroy((err) => {
          if (err) {
            resolve({
              success: false,
              message: "Logout failed.",
              user: null,
            });
            return;
          }

          context.res.clearCookie("devpilot.sid");

          resolve({
            success: true,
            message: "Logout successful.",
            user: null,
          });
        });
      });
    },
  },
};