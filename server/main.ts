import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import { typeDefs, resolvers } from "./graph";

import { ApolloServer } from "apollo-server-express";
import { Request } from "express";

import { getAuthContextFromExpressRequest } from "./graph/auth";

const server = new ApolloServer({
    introspection: Meteor.isDevelopment,
    debug: Meteor.isDevelopment,
    typeDefs,
    resolvers,
    context: async ({ req }: { req: Request }) => {
        return {
            auth: await getAuthContextFromExpressRequest(req),
        };
    },
});

server.applyMiddleware({
    app: <any>WebApp.connectHandlers,
});

server.installSubscriptionHandlers(WebApp.httpServer);
