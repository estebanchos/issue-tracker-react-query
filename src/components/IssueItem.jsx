import { Link } from "react-router-dom";
import { GoIssueOpened, GoIssueClosed, GoComment } from 'react-icons/go';
import { relativeDate } from "../helpers/relativeDate";
import { useUserData } from "../helpers/useUserData";
import { Label } from "./Label";

export function IssueItem({ title, number, assignee, commentCount, createdBy, createdDate, labels, status, }) {
  const assigneeUser = useUserData(assignee)
  const createdByUser = useUserData(createdBy)

  return (
    <li>
      {/* Icon section */}
      <div>
        {status === 'done' || status === 'cancel' ?
          <GoIssueClosed style={{ color: "red" }} />
          : <GoIssueOpened style={{ color: "green" }} />}
      </div>
      {/* Content section */}
      <div className="issue-content">
        <span>
          <Link to={`/issue/${number}`}>{title}</Link>
          {labels.map(label => (
            <Label key={label} label={label} />
          ))}
        </span>
        <small>
          #{number} opened {relativeDate(createdDate)} {createdByUser.isSuccess ? `by ${createdByUser.data.name}` : ''}
        </small>
      </div>
      {/* Image and comments section */}
      {assignee ?
        assigneeUser.isLoading ? "..." :
          <img
            src={assigneeUser.isSuccess ? assigneeUser.data.profilePictureUrl : ''}
            className='assigned-to'
            alt={`Assigned to ${assigneeUser.isSuccess ? assigneeUser.data.name : 'avatar'}`} />
        : null}
      <span className="comment-count">
        {commentCount > 0 ? (
          <>
            <GoComment />
            {commentCount}
          </>
        ) : null}
      </span>
    </li>
  );
}

