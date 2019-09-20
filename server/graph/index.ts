import { load } from "graphql-load";
import { PubSub } from "apollo-server-express";
import gql from "graphql-tag";

const pubsub = new PubSub();
const CURRENT_TIME = "CURRENT_TIME";

let updateInterval = 1000;

function updateTime() {
    pubsub.publish(CURRENT_TIME, new Date().toISOString());
    setTimeout(updateTime, updateInterval);
}

updateTime();

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
