import { useQuery } from "@tanstack/react-query";
import { defaultLabels } from "./defaultData";


export function useLabelsData() {
  const labelsQuery = useQuery(
    ['labels'],
    ({ signal }) => fetch('/api/labels', { signal }).then(res => res.json()),
    { 
      staleTime: 1000 * 60 * 60, // 1 hour
      placeholderData: defaultLabels // loads 3 default labels while continues fetching. Better user experience because it doesn't see a loading state
    } 
  )

  return labelsQuery
}