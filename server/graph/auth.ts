import { createAuth } from "../helpers/createAuth";
import { findOne } from "../helpers/mongo";
import { ObjectID } from "bson";
import bcrypt from "bcrypt";

const { getAuthContextFromExpressRequest, ifAuthenticated, typeDefs, resolvers } = createAuth({
    findUserWithPassword: async (username, password) => {
        const user = await findOne<{ _id: ObjectID; password: string }>(
            "users",
            { email: username },
            { _id: 1, password: 1 },
        );

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error("Login failed");
        }
        return {
            _id: user._id,
        };
    },
});

export { getAuthContextFromExpressRequest, ifAuthenticated, typeDefs, resolvers };
