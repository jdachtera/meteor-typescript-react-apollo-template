import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import "./graph";
import { getSchema } from "graphql-load";
import { ApolloServer } from "apollo-server-express";

const { typeDefs, resolvers } = getSchema();

const server = new ApolloServer({
    introspection: Meteor.isDevelopment,
    debug: Meteor.isDevelopment,
    typeDefs,
    resolvers,
});

server.applyMiddleware({
    app: <any>WebApp.connectHandlers,
});

server.installSubscriptionHandlers(WebApp.httpServer);
