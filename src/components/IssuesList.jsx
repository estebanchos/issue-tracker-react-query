//  Component has error handling
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import fetchWithError from "../helpers/fetchWithError";
import { IssueItem } from "./IssueItem";

export default function IssuesList({ labels, status }) {
  const [searchValue, setSearchValue] = useState('')

  const issuesQuery = useQuery(
    // add labels as object to show that it's an option or a filter
    ['issues', { labels, status }],
    ({ signal }) => {
      // we check if there's a status, i.e. string is not empty string
      const statusString = status ? `&status=${status}` : ''
      const labelsString = labels.map(label => `labels[]=${label}`).join('&')
      return fetchWithError(`/api/issues?${labelsString}${statusString}`, { signal })
    }
  )

  const searchQuery = useQuery(['issues', 'search', searchValue],
    // signal will allow us to cancel a request if the user submits a new search term, or if the users goes to another page.
    ({ signal }) => {
      return fetch(`/api/search/issues?q=${searchValue}`, { signal }).then(res => res.json())
    },
    { enabled: searchValue.length > 0 }
  )

  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault()
          setSearchValue(e.target.elements.search.value)
        }}
      >
        <label htmlFor="search">Search Issues</label>
        <input
          type='search'
          placeholder="Search"
          name="search"
          id='search'
          // we want to use onChange so that if there's an empty string when submitted, we set the value to ''
          // it clears searchValue so that it shows all the list of issues
          onChange={e => {
            if (e.target.value.length === 0) setSearchValue('')
          }}
        />
      </form>

      <h2>Issues List</h2>
      {issuesQuery.isLoading
        ? <p>Loading...</p>
        : issuesQuery.isError
          ? <p>{issuesQuery.error.message}</p>
          : searchQuery.fetchStatus === 'idle' && searchQuery.isLoading // if condition is met, there's no search active. Display all issues
            ? (
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
            )
            : ( // this section means that there's an active search
              <>
                <h2>Search Results</h2>
                {searchQuery.isLoading
                  ? <p>Loading...</p>
                  : <>
                    <p>{searchQuery.data.count} Results</p>
                    <ul className="issues-list">
                      {searchQuery.data.items.map(issue => (
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
                  </>
                }
              </>
            )
      }
    </div>
  );
}
