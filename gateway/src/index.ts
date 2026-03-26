import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } from "@apollo/gateway";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  override willSendRequest({ request, context }: any) {
    if (context.cookie) {
      request.http?.headers.set("cookie", context.cookie);
    }
  }
}

const startGateway = async () => {
  const app = express();

  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        { name: "auth", url: "http://localhost:4001/graphql" },
        { name: "projects", url: "http://localhost:4002/graphql" },
      ],
    }),
    buildService({ url }) {
      return new AuthenticatedDataSource({ url });
    },
  });

  const server = new ApolloServer({
    gateway,
  });

  await server.start();

  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(bodyParser.json());

  app.use(
    "/graphql",
    expressMiddleware(server, {
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