import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StatusSelect } from "./StatusSelect";

export default function IssueStatus({ status, issueNumber }) {
  const queryClient = useQueryClient()
  const setStatus = useMutation((status) => {
    return fetch(`/api/issues/${issueNumber}`, {
      method: 'PUT',
      headers: {
        'content': 'application/json'
      },
      body: JSON.stringify({ status })
    }).then(res => res.json())
  }, {
    onMutate: (status) => {
      const oldStatus = queryClient.getQueryData(['issues', issueNumber]).status
      queryClient.setQueryData(['issues', issueNumber],
        (data) => ({
          ...data,
          status,
        })
      )
      return () => {
        // rollback function
        queryClient.setQueryData(['issues', issueNumber], (data) => ({
          ...data,
          status: oldStatus,
        })
        )
      }
    },
    onError: (error, variables, rollback) => {
      // we only rollback if there's an error
      rollback()
    },
    onSuccess: (data, variables, rollback) => {
      // not using in this example...
      // if we want to replace cache data to response from server
      // we "reset" the cache back to the original so we update with the data form the server
      // then we set the data response to the cache
      // rollback()
      // queryClient.setQueryData(['issues', issueNumber], data)
    },
    onSettled: () => {
      // we invalidate queries
      queryClient.invalidateQueries(['issues', issueNumber], { exact: true })
    }
  })
  return (
    <div className="issue-options">
      <div>
        <span>Status</span>
        <StatusSelect
          noEmptyOption
          value={status}
          onChange={(e) => setStatus.mutate(e.target.value)}
        />
      </div>
    </div>
  )
}