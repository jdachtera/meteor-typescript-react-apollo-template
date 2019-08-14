import React, { Component, useState } from "react";
import { useQuery, useSubscription, useMutation } from "react-apollo";
import gql from "graphql-tag";

export default function Hello() {
    const [name, setName] = useState("world");

    const { data: { sayHello = "" } = {} } = useQuery(
        gql`
            query SayHelloQuery($name: String!) {
                sayHello(name: $name)
            }
        `,
        { variables: { name } },
    );

    const { data: { currentTime = "" } = {} } = useSubscription(gql`
        subscription CurrentTime {
            currentTime
        }
    `);

    const [setUpdateIntervalTimeMutation] = useMutation(gql`
        mutation SetUpdateIntervalTime($timeInMs: Int!) {
            setUpdateIntervalTime(timeInMs: $timeInMs)
        }
    `);

    return (
        <div>
            <h1>{sayHello}</h1>

            <input value={name} onChange={e => setName(e.target.value)} />

            <div>The current time is: {currentTime}</div>

            <div>
                Update interval:
                <input
                    type="range"
                    min="50"
                    max="2000"
                    onChange={e =>
                        setUpdateIntervalTimeMutation({
                            variables: { timeInMs: parseInt(e.target.value, 10) },
                        })
                    }
                />
            </div>
        </div>
    );
}
