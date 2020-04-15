import { useSubscription, useQuery } from "react-apollo";
import gql from "graphql-tag";

import { User } from "./types";

export const useUsers = () => {
  const result = useSubscription(gql`
    subscription Users {
      users {
        id
        position {
          x
          y
        }
      }
    }
  `);

  const { users = [] }: { users: User[] } = result.data || {};

  const { data, loading, error } = useQuery(
    gql`
      query {
        currentUser {
          id
          position {
            x
            y
          }
        }
      }
    `
  );

  return {
    loading,
    currentUser: data && data.currentUser,
    users
  };
};
