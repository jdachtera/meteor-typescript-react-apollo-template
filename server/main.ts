import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";

import { load, getSchema } from "graphql-load";
import { ApolloServer, PubSub } from "apollo-server-express";
import gql from "graphql-tag";

const pubsub = new PubSub();
const CURRENT_TIME = "CURRENT_TIME";

let updateInterval = 1000;

load({
    typeDefs: gql`
        type Query {
            sayHello(name: String!): String
        }

        type Subscription {
            currentTime: String!
        }

        type Mutation {
            setUpdateIntervalTime(timeInMs: Int!): Boolean
        }
    `,
    resolvers: {
        Query: {
            sayHello: (root, { name }) => `Hello ${name}`,
        },
        Mutation: {
            setUpdateIntervalTime(root, { timeInMs }) {
                updateInterval = timeInMs;
            },
        },
        Subscription: {
            currentTime: {
                subscribe: () => pubsub.asyncIterator(CURRENT_TIME),
                resolve: payload => payload,
            },
        },
    },
});

const { typeDefs, resolvers } = getSchema();

function updateTime() {
    pubsub.publish(CURRENT_TIME, new Date().toISOString());
    setTimeout(updateTime, updateInterval);
}

updateTime();

const server = new ApolloServer({
    introspection: Meteor.isDevelopment,
    debug: Meteor.isDevelopment,
    formatError: e => ({
        message: e.message,
        locations: e.locations,
        path: e.path,
    }),
    typeDefs,
    resolvers,
});

server.applyMiddleware({
    app: <any>WebApp.connectHandlers,
});

server.installSubscriptionHandlers(WebApp.httpServer);
