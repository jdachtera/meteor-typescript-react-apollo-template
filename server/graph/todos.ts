import graphqlMongodbProjection from "../helpers/graphqlMongodbProjection";

import { PubSub, IResolvers, ITypedef } from "apollo-server-express";
import gql from "graphql-tag";

import { getMongoConnection, insertOne, updateOne, deleteOne, find, findOne } from "../helpers/mongo";
import { ifAuthenticated } from "./auth";
import { ObjectID } from "bson";

const pubsub = new PubSub();
const TODOS_COLLECTION = "todos";

Meteor.startup(async () => {
    const mongo = await getMongoConnection();

    await mongo.createCollection(TODOS_COLLECTION);

    mongo
        .collection(TODOS_COLLECTION)
        .watch()
        .on("change", ({ operationType }) => {
            pubsub.publish(`${TODOS_COLLECTION}_CHANGED`, { operationType });
        });
});

export const TodosRoot: {
    typeDefs: ITypedef;
    resolvers: IResolvers;
} = {
    typeDefs: gql`
        type Query
        type Mutation
        type Subscription

        type Todo {
            _id: ID!
            title: String!
            done: Boolean!
        }

        input TodoInput {
            title: String
            done: Boolean
        }

        type ChangeEvent {
            operationType: String!
        }

        extend type Query {
            todos: [Todo!]!
            todo: Todo
        }

        extend type Mutation {
            addTodo(todo: TodoInput!): Todo!
            updateTodo(_id: ID!, todo: TodoInput!): Todo!
            deleteTodo(_id: ID): ID
        }

        extend type Subscription {
            todosChanged: ChangeEvent
        }
    `,
    resolvers: {
        Query: {
            todos: ifAuthenticated((root, args, { auth: { data: { _id: owner } } }, info) =>
                find(TODOS_COLLECTION, { owner }, graphqlMongodbProjection(info)),
            ),
            todo: (root, { _id }, context, info) => findOne(TODOS_COLLECTION, { _id }, graphqlMongodbProjection(info)),
        },
        Mutation: {
            addTodo: (
                root,
                { todo: { title, done = false } }: { todo: { title: string; done: boolean } },
                {
                    auth: {
                        data: { _id: owner },
                    },
                },
            ) => insertOne(TODOS_COLLECTION, { title, done, owner }),

            updateTodo: (
                root,
                { _id, todo }: { _id: string; todo: { title: string; done: boolean } },
                {
                    auth: {
                        data: { _id: owner },
                    },
                },
                info,
            ) => updateOne(TODOS_COLLECTION, { _id: new ObjectID(_id), owner }, todo, graphqlMongodbProjection(info)),

            deleteTodo: (
                root,
                { _id }: { _id: string },
                {
                    auth: {
                        data: { _id: owner },
                    },
                },
            ) => deleteOne(TODOS_COLLECTION, { _id: new ObjectID(_id), owner }),
        },
        Subscription: {
            todosChanged: {
                subscribe: () => pubsub.asyncIterator(`${TODOS_COLLECTION}_CHANGED`),
                resolve: payload => {
                    return payload;
                },
            },
        },
    },
};
