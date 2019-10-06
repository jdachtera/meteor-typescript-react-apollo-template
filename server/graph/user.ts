import gql from "graphql-tag";
import bcrypt from "bcrypt";
import { insertOne } from "../helpers/mongo";

export const UserRoot = {
    typeDefs: gql`
        input NewUser {
            email: String!
            password: String!
        }

        type User {
            _id: ID!
            email: String
        }

        extend type Mutation {
            createNewUser(user: NewUser): User
        }
    `,
    resolvers: {
        Mutation: {
            async createNewUser(root, { user }) {
                const { email, password } = user;

                const { _id } = await insertOne("users", {
                    email,
                    password: await bcrypt.hash(password, 10),
                });

                return { _id, email };
            },
        },
    },
};
