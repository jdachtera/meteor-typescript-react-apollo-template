import React from "react";

import { useQuery } from "react-apollo";
import gql from "graphql-tag";

import { Login } from "./Login";

export const Protected = ({ component: WrappedComponent }) => {
    const { loading, error, data } = useQuery(gql`
        query AuthQuery {
            auth {
                id
                accessToken
            }
        }
    `);

    if (loading) {
        return null;
    }

    if (error || !data.auth.accessToken) {
        return <Login />;
    }

    return <WrappedComponent />;
};
