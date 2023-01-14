import { useQuery } from "@tanstack/react-query";

export function useUserData(userId) {
  const usersData = useQuery(
    ['users', userId],
    // adding signal will allow us to cancel the request
    ({ signal }) => fetch(`api/users/${userId}`, { signal }).then(res => res.json()),
    { staleTime: 1000 * 60 * 5 } // 5 minutes
  )

  return usersData
}