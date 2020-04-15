import { setContext } from "apollo-link-context";
import { HttpLink } from "apollo-link-http";
import { SubscriptionClient } from "subscriptions-transport-ws";

import { WebSocketLink } from "apollo-link-ws";
import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";

import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";

const contextLink = setContext(() => ({
  headers: {
    Authorization: localStorage.getItem("userId") || ""
  }
}));

// Create an http link:
const httpLink = new HttpLink();

const wsClient = new SubscriptionClient(
  `${window.location.origin}/graphql`.replace(/^http/, "ws"),
  {
    reconnect: true,
    connectionParams: () => {
      const authorization = localStorage.getItem("userId") || "";
      return authorization ? { authorization, headers: { authorization } } : {};
    }
  }
);

const wsLink = new WebSocketLink(wsClient);

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = contextLink.concat(
  split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  )
);

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

export function restartWebsockets() {
  // Copy current operations
  const operations = Object.assign({}, wsClient.operations);

  // Close connection
  wsClient.close(true);

  // Open a new one
  wsClient.connect();

  // Push all current operations to the new connection
  Object.keys(operations).forEach(id => {
    wsClient.sendMessage(id, MessageTypes.GQL_START, operations[id].options);
  });
}
