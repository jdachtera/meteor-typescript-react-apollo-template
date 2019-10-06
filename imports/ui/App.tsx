import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";

import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";

import Hello from "./Hello";
import Info from "./Info";
import { split, ApolloLink } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";
import { Login } from "./Login";
import { Protected } from "./Protected";
import { TodosList } from "./TodosList";

const authLink = new ApolloLink((operation, forward) => {
    // Retrieve the authorization token from local storage.
    const token = localStorage.getItem("access_token");

    // Use the setContext method to set the HTTP headers.
    operation.setContext({
        headers: {
            authorization: token ? `Bearer ${token}` : "",
        },
    });

    // Call the next link in the middleware chain.
    return forward(operation);
});

// Create an http link:
const httpLink = authLink.concat(new HttpLink());

const wsLink = new WebSocketLink({
    uri: `${window.location.origin}/graphql`.replace(/^http/, "ws"),
    options: {
        reconnect: true,
    },
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
    // split based on operation type
    ({ query }) => {
        const definition = getMainDefinition(query);
        return definition.kind === "OperationDefinition" && definition.operation === "subscription";
    },
    wsLink,
    httpLink,
);

const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
});

const App = () => (
    <ApolloProvider client={apolloClient}>
        <div>
            <h1>Welcome to Meteor!</h1>
        </div>
        <Protected component={TodosList} />
    </ApolloProvider>
);

export default App;
