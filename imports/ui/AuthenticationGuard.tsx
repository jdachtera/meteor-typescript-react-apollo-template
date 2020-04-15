import React from "react";
import { useMutation, useQuery } from "react-apollo";
import { gql } from "apollo-server-express";
import { useEffect } from "react";
import { restartWebsockets } from "./apolloClient";

const useAuthentication = () => {
    const { data: { isAuthenticated = false } = {}, loading, error, refetch } = useQuery(gql`
        query {
            isAuthenticated
        }
    `);

    const [createUser, { data }] = useMutation<{ id: string }>(
        gql`
            mutation {
                createUser {
                    id
                }
            }
        `,
    );

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            (async () => {
                const {
                    data: {
                        createUser: { id },
                    },
                } = await createUser();

                localStorage.setItem("userId", id);

                restartWebsockets();
                refetch();
            })();
        }
    }, [loading, isAuthenticated]);

    return { isAuthenticated, authenticationError: error };
};

export const AuthenticationGuard = ({ children }) => {
    const { isAuthenticated, authenticationError } = useAuthentication();

    if (!isAuthenticated) return <>Loading</>;
    return <>{children}</>;
};
