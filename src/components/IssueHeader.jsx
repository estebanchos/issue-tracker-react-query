import { GoIssueOpened, GoIssueClosed } from 'react-icons/go';
import { possibleStatus } from '../helpers/defaultData';
import { useUserData } from "../helpers/useUserData";
import { relativeDate } from "../helpers/relativeDate";

export function IssueHeader({
  title, number, status = 'todo', // we give a default value of'todo', in case there's no data in the query
  createdBy, createdDate, comments
}) {
  const statusObject = possibleStatus.find(pstatus => pstatus.id === status);
  const createUser = useUserData(createdBy);

  return (
    <header>
      <h2>{title} <span>#{number}</span></h2>
      <div>
        <span className={status === 'done' || status === 'cancelled' ? 'closed' : 'open'}>
          {status === 'done' || status === 'cancel' ?
            <GoIssueClosed />
            : <GoIssueOpened />}
          {statusObject.label}
        </span>
        <span className="created-by">
          {createUser.isLoading ? '...' : createUser.data?.name}
        </span>{' '}
        opened this issue {relativeDate(createdDate)} · {comments.length} comments
      </div>
    </header>
  );
}
