import {
  ApolloGateway,
  IntrospectAndCompose,
  RemoteGraphQLDataSource
} from "@apollo/gateway";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";

function initGateway(httpServer) {  
  const gateway = new ApolloGateway({
    debug: true,
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        { name: "accounts", url: process.env.ACCOUNTS_ENDPOINT },
        { name: "profiles", url: process.env.PROFILES_ENDPOINT }
      ],
      pollIntervalInMs: 1000
    }),
    buildService({ url }) {
      return new RemoteGraphQLDataSource({
        url,
        willSendRequest({ request, context }) {
          request.http.headers.set(
            "user",
            context.user ? JSON.stringify(context.user) : null
          );
        }
      });
    }
  });

  return new ApolloServer({
    gateway,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: ({ req }) => {
      const user = req.user || null;
      return { user };
    }
  });
}

export default initGateway;