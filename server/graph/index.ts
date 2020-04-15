import { load } from "graphql-load";
import { PubSub } from "apollo-server-express";
import gql from "graphql-tag";
import { v4 } from "uuid";

const pubsub = new PubSub();
const USERS = "USERS";

let users = {};

function updateTime() {
    pubsub.publish(USERS, getUsers());

    setTimeout(updateTime, 1000);
}

export const upsertUser = user => {
    if (JSON.stringify(user) !== JSON.stringify(users[user.id])) {
        users = {
            ...users,
            [user.id]: {
                id: null,
                position: {
                    x: 0.5,
                    y: 0.5,
                },
                ...users[user.id],
                ...user,
            },
        };
        pubsub.publish(USERS, getUsers());
    }
    return user;
};

const getUsers = () => {
    return Object.values(users).filter(user => user.id && user.isOnline);
};
//updateTime();

const getCurrentUser = context => {
    return users[context.userId] || { id: null, x: 0.5, y: 0.5 };
};

load({
    typeDefs: gql`
        type Query {
            isAuthenticated: Boolean!
            currentUser: User!
        }

        type Subscription {
            users: [User!]!
        }

        type Mutation {
            createUser: User!
            move(x: Float!, y: Float!): User!
        }

        type Position {
            x: Float!
            y: Float!
        }

        type User {
            id: String
            name: String!
            position: Position
        }
    `,
    resolvers: {
        Query: {
            isAuthenticated: (root, args, context) => !!context.userId,
            currentUser: (root, args, context) => getCurrentUser(context),
        },
        Mutation: {
            createUser: () =>
                upsertUser({
                    id: v4(),
                    name: "",
                }),
            move: (root, args, context) =>
                upsertUser({
                    id: context.userId,
                    position: {
                        x: args.x,
                        y: args.y,
                    },
                }),
        },
        Subscription: {
            users: {
                subscribe: () => pubsub.asyncIterator(USERS),
                resolve: payload => payload,
            },
        },
    },
});
