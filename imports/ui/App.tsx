import React from "react";
import { ApolloProvider } from "react-apollo";

import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";

import Hello from "./Hello";
import Info from "./Info";
import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";

// Create an http link:
const httpLink = new HttpLink();

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
            <Hello />
            <Info />
        </div>
    </ApolloProvider>
);

export default App;
