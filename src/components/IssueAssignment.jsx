import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { GoGear } from "react-icons/go"
import { useUserData } from "../helpers/useUserData"

export function IssueAssignment({ assignee, issueNumber }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const queryClient = useQueryClient()
  const user = useUserData(assignee)
  const usersQuery = useQuery(['users'], () => fetch('/api/users').then(res => res.json()))
  
  const setAssignment = useMutation((assignee) => {
    return fetch(`/api/issues/${issueNumber}`, {
      method: 'PUT',
      headers: {
        'content': 'application/json'
      },
      body: JSON.stringify({ assignee })
    }).then(res => res.json())
  }, {
    onMutate: (assignee) => {
      // we only get the assignee data from the user
      const oldAssignee = queryClient.getQueryData(['issues', issueNumber]).assignee
      queryClient.setQueryData(['issues', issueNumber],
        (data) => ({
          ...data,
          assignee,
        })
      )
      setMenuOpen(false)
      return () => {
        // rollback function
        queryClient.setQueryData(['issues', issueNumber], (data) => ({
          ...data,
          assignee: oldAssignee,
        })
        )
      }
    },
    onError: (error, variables, rollback) => {
      // we only rollback if there's an error
      rollback()
    },
    onSettled: () => {
      // we invalidate this issue query
      queryClient.invalidateQueries(['issues', issueNumber], { exact: true })
    }
  })

  return (
    <div className="issue-options">
      <div>
        <span>Assignment</span>
        {
          // if user query is success, then it shows the component.
          user.isSuccess && (
            <div>
              <img src={user.data.profilePictureUrl} />
              {user.data.name}
            </div>
          )
        }
      </div>
      <GoGear onClick={() => !usersQuery.isLoading && setMenuOpen((open) => !open)} />
      {menuOpen && (
        <div className="picker-menu">
          {usersQuery.data?.map(user => (
            <div key={user.id} onClick={() => setAssignment.mutate(user.id)}>
              <img src={user.profilePictureUrl} />
              {user.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}