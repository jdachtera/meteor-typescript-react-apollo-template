import { TodosRoot } from "./todos";
import { concatenateTypeDefs, IResolverObject } from "graphql-tools";
import { mergeDeep } from "apollo-utilities";
import * as auth from "./auth";
import { UserRoot } from "./user";

export const typeDefs = concatenateTypeDefs([TodosRoot.typeDefs, auth.typeDefs, UserRoot.typeDefs]);
export const resolvers = mergeDeep([TodosRoot.resolvers, auth.resolvers, UserRoot.resolvers]);
