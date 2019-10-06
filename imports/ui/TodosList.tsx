import React, { useEffect } from "react";

import { useQuery, useMutation } from "react-apollo";
import gql from "graphql-tag";

const GET_TODOS_QUERY = gql`
    query Todos {
        todos {
            _id
            title
            done
        }
    }
`;

const UPDATE_TODO_MUTATION = gql`
    mutation UpdateTodo($_id: ID!, $todo: TodoInput!) {
        updateTodo(_id: $_id, todo: $todo) {
            _id
            title
            done
        }
    }
`;

const ADD_TODO_MUTATION = gql`
    mutation AddTodo($title: String!) {
        addTodo(todo: { title: $title }) {
            _id
            title
            done
        }
    }
`;

const DELETE_TODO_MUTATION = gql`
    mutation DeleteTodo($_id: ID!) {
        deleteTodo(_id: $_id)
    }
`;

export const TodosList = () => {
    const { loading, error, data, refetch } = useQuery(GET_TODOS_QUERY);
    const [updateTodo] = useMutation(UPDATE_TODO_MUTATION);
    const [addTodo] = useMutation(ADD_TODO_MUTATION);
    const [deleteTodo] = useMutation(DELETE_TODO_MUTATION);

    if (loading) {
        return "Loading";
    }

    if (error) {
        return error.message;
    }

    return (
        <ul>
            {data.todos.map(todo => (
                <li key={todo._id}>
                    <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() => {
                            updateTodo({
                                variables: { _id: todo._id, todo: { done: !todo.done } },
                                optimisticResponse: { updateTodo: { ...todo, done: !todo.done } },
                            });
                        }}
                    />
                    <input
                        type="text"
                        style={{ border: "none", margin: 0, outline: 0 }}
                        value={todo.title}
                        onChange={event => {
                            updateTodo({
                                variables: { _id: todo._id, todo: { title: event.target.value } },
                                optimisticResponse: { updateTodo: { ...todo, title: event.target.value } },
                            });
                        }}
                    />
                    <button
                        onClick={() => {
                            deleteTodo({
                                variables: { _id: todo._id },
                                update: proxy => {
                                    const data = proxy.readQuery({ query: GET_TODOS_QUERY });

                                    proxy.writeQuery({
                                        query: GET_TODOS_QUERY,
                                        data: {
                                            ...data,
                                            todos: data.todos.filter(({ _id }) => todo._id !== _id),
                                        },
                                    });
                                },
                            });
                        }}
                    >
                        X
                    </button>
                </li>
            ))}
            <li>
                <form
                    onSubmit={async event => {
                        event.preventDefault();
                        const el = event.target.elements.newTodoTitle;
                        await addTodo({
                            variables: { title: el.value },
                            update: (proxy, { data: { addTodo } }) => {
                                const data = proxy.readQuery({ query: GET_TODOS_QUERY });

                                proxy.writeQuery({
                                    query: GET_TODOS_QUERY,
                                    data: {
                                        ...data,
                                        todos: [...data.todos, addTodo],
                                    },
                                });
                            },
                        });

                        el.value = "";
                    }}
                >
                    <input name="newTodoTitle"></input>
                </form>
            </li>
        </ul>
    );
};
