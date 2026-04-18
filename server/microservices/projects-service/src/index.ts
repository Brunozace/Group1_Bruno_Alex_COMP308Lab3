import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import { createSessionMiddleware } from "./config/session.js";

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
      context: async ({ req }) => ({ req }),
    })
  );

  const PORT = Number(process.env.PORT) || 4002;
  app.listen(PORT, () => {
    console.log(`Projects Service running on http://localhost:${PORT}/graphql`);
  });
};

startServer().catch((err) => {
  console.error("Projects Service failed to start:", err);
});
