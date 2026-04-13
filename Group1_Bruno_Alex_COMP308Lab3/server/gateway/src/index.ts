import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import {
  ApolloGateway,
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
} from "@apollo/gateway";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  override willSendRequest({ request, context }: any) {
    if (context.cookie) {
      request.http?.headers.set("cookie", context.cookie);
    }
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const startGateway = async () => {
  const app = express();

  const authUrl = process.env.AUTH_SUBGRAPH_URL || "http://localhost:4001/graphql";
  const projectsUrl = process.env.PROJECTS_SUBGRAPH_URL || "http://localhost:4002/graphql";
  const aiReviewUrl = process.env.AI_REVIEW_SUBGRAPH_URL || "http://localhost:4003/graphql";

  let server: ApolloServer | null = null;
  let started = false;

  while (!started) {
    try {
      const gateway = new ApolloGateway({
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            { name: "auth", url: authUrl },
            { name: "projects", url: projectsUrl },
            { name: "aiReview", url: aiReviewUrl }
          ],
        }),
        buildService({ url }) {
          return new AuthenticatedDataSource({ url });
        },
      });

      server = new ApolloServer({ gateway });
      await server.start();
      started = true;
      console.log("✅ Gateway connected to all subgraphs");
    } catch (err) {
      console.log("⏳ Gateway waiting for subgraphs...");
      await sleep(3000);
    }
  }

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(bodyParser.json());

  app.use(
    "/graphql",
    expressMiddleware(server!, {
      context: async ({ req }) => ({
        cookie: req.headers.cookie || "",
      }),
    })
  );

  const PORT = Number(process.env.PORT) || 4000;
  app.listen(PORT, () => {
    console.log(`Gateway running on http://localhost:${PORT}/graphql`);
  });
};

startGateway().catch((err) => {
  console.error("Gateway failed to start:", err);
});