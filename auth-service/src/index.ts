import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { typeDefs } from "../src/graphql/typeDefs.js";
import { resolvers } from "../src/graphql/resolvers.js";
import { createSessionMiddleware } from "../src/config/session.js";

const startServer = async () => {
  const app = express();

  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devpilot"
  );

  const server = new ApolloServer({
    schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  });

  await server.start();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(createSessionMiddleware());

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => ({ req, res }),
    })
  );

  const PORT = Number(process.env.PORT) || 4001;
  app.listen(PORT, () => {
    console.log(`Auth Service running on http://localhost:${PORT}/graphql`);
  });
};

startServer().catch((err) => {
  console.error("Auth Service failed to start:", err);
});
