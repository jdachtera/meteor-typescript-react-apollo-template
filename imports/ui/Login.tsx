import React, { useEffect } from "react";
import { useMutation } from "react-apollo";
import gql from "graphql-tag";

export const Login = () => {
    const [login, { loading, error, data }] = useMutation(gql`
        mutation Login($username: String!, $password: String!) {
            loginWithPassword(username: $username, password: $password) {
                id
                accessToken
            }
        }
    `);

    return (
        <form
            onSubmit={async event => {
                event.preventDefault();
                const { data } = await login({
                    variables: {
                        username: event.target.elements["username"].value,
                        password: event.target.elements["password"].value,
                    },
                });
                console.log(data);
                localStorage.setItem("access_token", data.loginWithPassword.accessToken);
            }}
        >
            {error && <span>{error.message}</span>}
            <label htmlFor="username">User</label>
            <input name="username" />
            <label htmlFor="password">Password</label>
            <input name="password" />
            <button type="submit">Login</button>
        </form>
    );
};
