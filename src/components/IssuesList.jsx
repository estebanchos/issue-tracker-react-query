import { useQuery } from "@tanstack/react-query";
import { IssueItem } from "./IssueItem";

export default function IssuesList({ labels, status }) {
  const issuesQuery = useQuery(
    // add labels as object to show that it's an option or a filter
    ['issues', { labels, status }],
    () => {
      // we check if there's a status, i.e. string is not empty string
      const statusString = status ? `&status=${status}` : ''
      const labelsString = labels.map(label => `labels[]=${label}`).join('&')
      return fetch(`/api/issues?${labelsString}${statusString}`).then(res => res.json())
    }
  )

  return (
    <div>
      <h2>Issues List</h2>
      {issuesQuery.isLoading ? <p>Loading...</p> :
        <ul className="issues-list">
          {issuesQuery.data.map(issue => (
            <IssueItem
              key={issue.id}
              title={issue.title}
              number={issue.number}
              assignee={issue.assignee}
              commentCount={issue.comments.length}
              createdBy={issue.createdBy}
              // we could also pass all props by spreading... 
              // {...issue}
              createdDate={issue.createdDate}
              labels={issue.labels}
              status={issue.status}
            />
          ))}
        </ul>
      }
    </div>
  );
}
