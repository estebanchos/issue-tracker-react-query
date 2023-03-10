//  Component has error handling
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import fetchWithError from "../helpers/fetchWithError";
import { IssueItem } from "./IssueItem";
import Loader from "./Loader";

export default function IssuesList({ labels, status, pageNum, setPageNum }) {
  const [searchValue, setSearchValue] = useState('')
  const queryClient = useQueryClient()

  const issuesQuery = useQuery(
    // add labels as object to show that it's an option or a filter
    ['issues', { labels, status, pageNum }],
    async ({ signal }) => { // we use the data here to prepopulate our issuesDetails query
      // we check if there's a status, i.e. string is not empty string
      const statusString = status ? `&status=${status}` : ''
      const labelsString = labels.map(label => `labels[]=${label}`).join('&')
      // we will conditionally create a pagination string
      const paginationString = pageNum ? `&page=${pageNum}` : ''

      const results = await fetchWithError(`/api/issues?${labelsString}${statusString}${paginationString}`, { signal })

      results.forEach(issue => {
        queryClient.setQueryData(['issues', String(issue.number)], issue) // we transform issue.number into string because it comes back as number
      })

      return results
    },
    // we want to keep the previous data so that we don't have to wait for the new data to come back before we can display the previous data
    { keepPreviousData: true }
  )

  const searchQuery = useQuery(
    ['issues', 'search', searchValue],
    // signal will allow us to cancel a request if the user submits a new search term, or if the users goes to another page.
    ({ signal }) => fetch(`/api/search/issues?q=${searchValue}`, { signal }).then(res => res.json()),
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
      {/* isFetching will be true anytime data is being retrieved, except on the first load */}
      <h2>Issues List {issuesQuery.isFetching ? <Loader /> : null}</h2>
      {issuesQuery.isLoading
        ? <p>Loading...</p>
        : issuesQuery.isError
          ? <p>{issuesQuery.error.message}</p>
          : searchQuery.fetchStatus === 'idle' && searchQuery.isLoading // if condition is met, there's no search active. Display all issues
            ? (
              <>
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
                <div className="pagination">
                  <button
                    onClick={() => {
                      if (pageNum - 1 > 0) setPageNum(pageNum - 1)
                    }}
                    disabled={pageNum === 1}
                  >Previous</button>
                  <p>Page {pageNum} {issuesQuery.isFetching ? '...' : ''}</p>
                  <button
                    onClick={() => {
                      if (issuesQuery.data?.length !== 0 && !issuesQuery.isPreviousData) setPageNum(pageNum + 1)
                    }}
                    // if we are using previous data we don't want to enable the next button
                    disabled={issuesQuery.data?.length === 0 || issuesQuery.isPreviousData}
                  >Next</button>
                </div>

              </>
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
                          createdDate={issue.createdDate}
                          labels={issue.labels}
                          status={issue.status}
                        // we could also pass all props by spreading... 
                        // {...issue}
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
