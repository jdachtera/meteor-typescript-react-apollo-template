import { Request } from "express";

import jwt from "jsonwebtoken";
import gql from "graphql-tag";

const defaultSecretKey = {
    privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgFKnj6A0UU29Mw4Vy1k4vD0x1x7GcpyoG1HrG1qMgefhbdqD7W3R
ogfdlTQUlqGOn3cLvYY/o+1OmLsfKphWyKPlvK263Ze+Oz/VY2Ggawg0KGHbzebv
+FV8/5UfobpbDtl2V4sCfcDdoniue8j+lp2kAXewU9O9IoCODrGZ9KEnAgMBAAEC
gYA/2adPB/tixWyiTd3Hr9diopTe9khlkkuAjdGUsoRL385gBpgsxMuZrefr0pfG
eAniCdS/13vH/3Zm3x2ljyzw5iWOXubkep+lL88PRLPL9oqigZ3QpYHo6MZlueG4
CMhvvO6vs/gtltE4hZfie36f7UmdE9lmA9f2PxYI0t6nwQJBAJ5KrLtffFN2PuAk
mjqgqDtoebe95ff+OsRSztPvoCdIK85WhnuAw0HE8aw3Eidilf8P1KWafo8fqIdE
rJOz5OECQQCFrKr3ykMx1Or0WAqOLqdhDxuhf+4Z0/m/u3tPYoB+meO1mAy9rlFB
RwlWntKA2e84r0MhlmMnqP92bqMrdj8HAkEAmOaXDXOBu3kn6QlSNTmE58XWdSco
4bEggQ1gHhaExA0Ry4GG6/uIIJqlu22CyqqPK07WYJTolUXGW8t5TD9j4QJAftVZ
lykz3olesZ8DzOqZaC90kSUYXytRMkoKc0VMFFOhyoDNvgAzGtPzGVwy8Y1XPRqW
gLz3sf7Y/Z92dNuKawJAP17YbsOTSOY0WKG35LPheiLkUjCApmWsOyT6xeb9CnYi
TvrISP0+dUQ1ILEKcSrDI7i5mPeAPBxCCC0qZ3xbsg==
-----END RSA PRIVATE KEY-----`,
    publicKey: `-----BEGIN PUBLIC KEY-----
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgFKnj6A0UU29Mw4Vy1k4vD0x1x7G
cpyoG1HrG1qMgefhbdqD7W3RogfdlTQUlqGOn3cLvYY/o+1OmLsfKphWyKPlvK26
3Ze+Oz/VY2Ggawg0KGHbzebv+FV8/5UfobpbDtl2V4sCfcDdoniue8j+lp2kAXew
U9O9IoCODrGZ9KEnAgMBAAE=
-----END PUBLIC KEY-----`,
    algorithm: "RS256",
};

export const createAuth = <Data extends Object>({
    secretKey = defaultSecretKey,
    findUserWithPassword = (username, password): Data => {
        throw new Error();
    },
    findUserForTokenData = data => data,
} = {}) => {
    type TokenData = { type: string; data: Data };

    const readAndVerifyToken = async (token): Promise<TokenData> => {
        const data: TokenData = await new Promise((resolve, reject) => {
            jwt.verify(token, secretKey.publicKey, { algorithms: [secretKey.algorithm] }, (error, decoded) => {
                if (error) {
                    reject(error);
                } else {
                    resolve((decoded as unknown) as TokenData);
                }
            });
        });

        return data;
    };

    const getTokenFromExpressRequest = (request: Request) => {
        const authHeader: string = Array.isArray(request.headers.authorization)
            ? request.headers.authorization[0]
            : request.headers.authorization || "";

        const token = authHeader.split(" ")[1];
        return token;
    };

    const getAuthContextFromExpressRequest = async (req: Request) => {
        const token = getTokenFromExpressRequest(req);

        return getAuthContext(token);
    };

    const getAuthContext = async accessToken => {
        console.log(accessToken);
        if (!accessToken) {
            return {
                id: "authState",
                isAuthenticated: false,
                accessToken: null,
                data: {},
            };
        }

        const { data, type } = await readAndVerifyToken(accessToken);

        if (type !== "access") {
            throw new Error("Invalid token");
        }

        return {
            id: "authState",
            isAuthenticated: true,
            accessToken,
            data,
        };
    };

    const createToken = async ({ type, data }: TokenData) => {
        const token = await new Promise((resolve, reject) => {
            jwt.sign(
                JSON.stringify({ type, data }),
                secretKey.privateKey,
                { algorithm: secretKey.algorithm },
                (error, token) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(token);
                    }
                },
            );
        });

        return token;
    };

    const createTokens = async data => {
        return {
            id: "authState",
            accessToken: await createToken({ type: "access", data }),
            refreshToken: await createToken({ type: "refresh", data }),
            data,
            isAuthenticated: true,
        };
    };

    const ifAuthenticated = resolver => (...args) => {
        const context = args[2];

        if (context.auth && context.auth.isAuthenticated) {
            return resolver(...args);
        } else {
            throw new Error("not authenticated");
        }
    };

    const typeDefs = gql`
        scalar AuthData

        type AuthState {
            id: ID!
            accessToken: String
            refreshToken: String
            isAuthenticated: Boolean!
            data: AuthData
        }

        extend type Query {
            auth: AuthState!
        }

        extend type Mutation {
            loginWithPassword(username: String!, password: String!): AuthState!
            refresh(token: String!): AuthState!
        }
    `;

    const resolvers = {
        Query: {
            auth: (root, args, { auth }) => auth,
        },
        Mutation: {
            loginWithPassword: async (root, { username, password }) => {
                const data = await findUserWithPassword(username, password);
                return createTokens(data);
            },
            refresh: async (root, { token }, {}) => {
                const { type, data } = await readAndVerifyToken(token);

                if (type !== "refresh") {
                    throw new Error("Invalid token");
                }

                const newData = await findUserForTokenData(data);
                return createTokens(newData);
            },
        },
    };

    return {
        getTokenFromExpressRequest,
        getAuthContextFromExpressRequest,
        getAuthContext,
        createToken,
        ifAuthenticated,
        typeDefs,
        resolvers,
    };
};
