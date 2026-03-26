import session from "express-session";
import MongoStore from "connect-mongo";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export const createSessionMiddleware = () =>
  session({
    name: "devpilot.sid",
    secret: process.env.SESSION_SECRET || "devpilot-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devpilot",
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: false, // change to true in production with HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  });