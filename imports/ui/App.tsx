import React from "react";
import { ApolloProvider } from "react-apollo";
import Hello from "./Hello";

import { AuthenticationGuard } from "./AuthenticationGuard";
import { apolloClient } from "./apolloClient";

const App = () => (
  <ApolloProvider client={apolloClient}>
    <div>
      <AuthenticationGuard>
        <Hello />
      </AuthenticationGuard>
    </div>
  </ApolloProvider>
);

export default App;
