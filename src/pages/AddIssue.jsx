import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function AddIssue() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const addIssue = useMutation(
    (issueBody) =>
      fetch('/api/issues', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(issueBody)
      }).then(res => res.json()),
    {
      onSuccess: (data) => {
        // we invalidate the issues query so that we get the latest data on the next refetch
        queryClient.invalidateQueries(['issues'], { exact: true })
        // we push the return object into the cache for that issue
        queryClient.setQueryData(['issues', data.number.toString()], data)
        navigate(`/issue/${data.number}`)
      }
    }

  )

  return (
    <div className="add-issue">
      <h2>Add Issue</h2>
      <form onSubmit={(e) => {
        e.preventDefault()
        if (addIssue.isLoading) return
        addIssue.mutate({
          comment: e.target.comment.value,
          title: e.target.title.value
        })
      }}>
        <label htmlFor="title">Title</label>
        <input type='text' id='title' placeholder='title' name='title' />
        <label htmlFor="comment">Comment</label>
        <textarea id='comment' placeholder='comment' name='comment' />
        <button type="submit" disabled={addIssue.isLoading}>
          {addIssue.isLoading ? 'Adding Issue...' : 'Add Issue'}
        </button>
      </form>
    </div>);
}
