import session from "express-session";
import MongoStore from "connect-mongo";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export const createSessionMiddleware = () =>
  session({
    name: process.env.SESSION_COOKIE_NAME || "devpilot.sid",
    secret: process.env.SESSION_SECRET || "best_test_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aiReviewServiceDB",
      collectionName: "sessions"
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  });