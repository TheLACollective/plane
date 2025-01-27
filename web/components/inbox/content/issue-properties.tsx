import React from "react";
import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { CalendarCheck2, CopyPlus, Signal, Tag } from "lucide-react";
import { TInboxDuplicateIssueDetails, TIssue } from "@plane/types";
import { ControlLink, DoubleCircleIcon, Tooltip, UserGroupIcon } from "@plane/ui";
// components
import { DateDropdown, PriorityDropdown, MemberDropdown, StateDropdown } from "@/components/dropdowns";
import { IssueLabel, TIssueOperations } from "@/components/issues";
// helper
import { getDate, renderFormattedPayloadDate } from "@/helpers/date-time.helper";
// hooks
import { useProject } from "@/hooks/store";

type Props = {
  workspaceSlug: string;
  projectId: string;
  issue: Partial<TIssue>;
  issueOperations: TIssueOperations;
  isEditable: boolean;
  duplicateIssueDetails: TInboxDuplicateIssueDetails | undefined;
};

export const InboxIssueContentProperties: React.FC<Props> = observer((props) => {
  const { workspaceSlug, projectId, issue, issueOperations, isEditable, duplicateIssueDetails } = props;

  const router = useRouter();
  // store hooks
  const { currentProjectDetails } = useProject();

  const minDate = issue.start_date ? getDate(issue.start_date) : null;
  minDate?.setDate(minDate.getDate());
  if (!issue || !issue?.id) return <></>;
  return (
    <div className="flex h-min w-full flex-col divide-y-2 divide-custom-border-200 overflow-hidden">
      <div className="h-min w-full overflow-y-auto px-3">
        <h5 className="text-sm font-medium my-4">Properties</h5>
        <div className={`divide-y-2 divide-custom-border-200 ${!isEditable ? "opacity-60" : ""}`}>
          <div className="flex flex-col gap-3">
            {/* State */}
            <div className="flex items-center gap-2 h-8">
              <div className="flex items-center gap-1 w-2/5 flex-shrink-0 text-sm text-custom-text-300">
                <DoubleCircleIcon className="h-4 w-4 flex-shrink-0" />
                <span>State</span>
              </div>
              {issue?.state_id && (
                <StateDropdown
                  value={issue?.state_id}
                  onChange={(val) =>
                    issue?.id && issueOperations.update(workspaceSlug, projectId, issue?.id, { state_id: val })
                  }
                  projectId={projectId?.toString() ?? ""}
                  disabled={!isEditable}
                  buttonVariant="transparent-with-text"
                  className="w-3/5 flex-grow group"
                  buttonContainerClassName="w-full text-left"
                  buttonClassName="text-sm"
                  dropdownArrow
                  dropdownArrowClassName="h-3.5 w-3.5 hidden group-hover:inline"
                />
              )}
            </div>
            {/* Assignee */}
            <div className="flex items-center gap-2 h-8">
              <div className="flex items-center gap-1 w-2/5 flex-shrink-0 text-sm text-custom-text-300">
                <UserGroupIcon className="h-4 w-4 flex-shrink-0" />
                <span>Assignees</span>
              </div>
              <MemberDropdown
                value={issue?.assignee_ids ?? []}
                onChange={(val) =>
                  issue?.id && issueOperations.update(workspaceSlug, projectId, issue?.id, { assignee_ids: val })
                }
                disabled={!isEditable}
                projectId={projectId?.toString() ?? ""}
                placeholder="Add assignees"
                multiple
                buttonVariant={
                  (issue?.assignee_ids || [])?.length > 0 ? "transparent-without-text" : "transparent-with-text"
                }
                className="w-3/5 flex-grow group"
                buttonContainerClassName="w-full text-left"
                buttonClassName={`text-sm justify-between ${
                  (issue?.assignee_ids || [])?.length > 0 ? "" : "text-custom-text-400"
                }`}
                hideIcon={issue.assignee_ids?.length === 0}
                dropdownArrow
                dropdownArrowClassName="h-3.5 w-3.5 hidden group-hover:inline"
              />
            </div>
            {/* Priority */}
            <div className="flex items-center gap-2 h-8">
              <div className="flex items-center gap-1 w-2/5 flex-shrink-0 text-sm text-custom-text-300">
                <Signal className="h-4 w-4 flex-shrink-0" />
                <span>Priority</span>
              </div>
              <PriorityDropdown
                value={issue?.priority || "none"}
                onChange={(val) =>
                  issue?.id && issueOperations.update(workspaceSlug, projectId, issue?.id, { priority: val })
                }
                disabled={!isEditable}
                buttonVariant="border-with-text"
                className="w-3/5 flex-grow rounded px-2 hover:bg-custom-background-80"
                buttonContainerClassName="w-full text-left"
                buttonClassName="w-min h-auto whitespace-nowrap"
              />
            </div>
          </div>
        </div>
        <div className={`divide-y-2 divide-custom-border-200 mt-3 ${!isEditable ? "opacity-60" : ""}`}>
          <div className="flex flex-col gap-3">
            {/* Due Date */}
            <div className="flex items-center gap-2 h-8">
              <div className="flex items-center gap-1 w-2/5 flex-shrink-0 text-sm text-custom-text-300">
                <CalendarCheck2 className="h-4 w-4 flex-shrink-0" />
                <span>Due date</span>
              </div>
              <DateDropdown
                placeholder="Add due date"
                value={issue.target_date || null}
                onChange={(val) =>
                  issue?.id &&
                  issueOperations.update(workspaceSlug, projectId, issue?.id, {
                    target_date: val ? renderFormattedPayloadDate(val) : null,
                  })
                }
                minDate={minDate ?? undefined}
                disabled={!isEditable}
                buttonVariant="transparent-with-text"
                className="w-3/5 flex-grow group"
                buttonContainerClassName="w-full text-left"
                buttonClassName={`text-sm ${issue?.target_date ? "" : "text-custom-text-400"}`}
                hideIcon
                clearIconClassName="h-3 w-3 hidden group-hover:inline"
              />
            </div>
            {/* Labels */}
            <div className="flex items-center gap-2 min-h-8">
              <div className="flex items-center gap-1 w-2/5 flex-shrink-0 text-sm text-custom-text-300">
                <Tag className="h-4 w-4 flex-shrink-0" />
                <span>Labels</span>
              </div>
              <div className="w-3/5 flex-grow min-h-8 h-full pt-1">
                {issue?.id && (
                  <IssueLabel
                    workspaceSlug={workspaceSlug}
                    projectId={projectId}
                    issueId={issue?.id}
                    disabled={!isEditable}
                    isInboxIssue
                    onLabelUpdate={(val: string[]) =>
                      issue?.id && issueOperations.update(workspaceSlug, projectId, issue?.id, { label_ids: val })
                    }
                  />
                )}
              </div>
            </div>

            {/* duplicate to*/}
            {duplicateIssueDetails && (
              <div className="flex min-h-8 gap-2">
                <div className="flex w-2/5 flex-shrink-0 gap-1 pt-2 text-sm text-custom-text-300">
                  <CopyPlus className="h-4 w-4 flex-shrink-0" />
                  <span>Duplicate of</span>
                </div>

                <ControlLink
                  href={`/${workspaceSlug}/projects/${projectId}/issues/${duplicateIssueDetails?.id}`}
                  onClick={() => {
                    router.push(`/${workspaceSlug}/projects/${projectId}/issues/${duplicateIssueDetails?.id}`);
                  }}
                >
                  <Tooltip tooltipContent={`${duplicateIssueDetails?.name}`}>
                    <span className="flex items-center gap-1 cursor-pointer text-xs rounded px-1.5 py-1 pb-0.5 bg-custom-background-80 text-custom-text-200">
                      {`${currentProjectDetails?.identifier}-${duplicateIssueDetails?.sequence_id}`}
                    </span>
                  </Tooltip>
                </ControlLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
