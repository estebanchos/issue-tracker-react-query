import { useQuery } from "@tanstack/react-query";

export function useUserData(userId) {
  const usersData = useQuery(
    ['users', userId],
    () => fetch(`api/users/${userId}`).then(res => res.json())
  )

  return usersData
}