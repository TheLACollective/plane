import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { TIssue } from "@plane/types";
import { Loader, TOAST_TYPE, setToast } from "@plane/ui";
// components
import { InboxIssueContentProperties } from "@/components/inbox/content";
import {
  IssueDescriptionInput,
  IssueTitleInput,
  IssueActivity,
  IssueReaction,
  TIssueOperations,
  IssueAttachmentRoot,
} from "@/components/issues";
// hooks
import { useEventTracker, useProjectInbox, useUser } from "@/hooks/store";
import useReloadConfirmations from "@/hooks/use-reload-confirmation";
// store types
import { IInboxIssueStore } from "@/store/inbox/inbox-issue.store";

type Props = {
  workspaceSlug: string;
  projectId: string;
  inboxIssue: IInboxIssueStore;
  isEditable: boolean;
  isSubmitting: "submitting" | "submitted" | "saved";
  setIsSubmitting: Dispatch<SetStateAction<"submitting" | "submitted" | "saved">>;
};

export const InboxIssueMainContent: React.FC<Props> = observer((props) => {
  const router = useRouter();
  const { workspaceSlug, projectId, inboxIssue, isEditable, isSubmitting, setIsSubmitting } = props;
  // hooks
  const { currentUser } = useUser();
  const { setShowAlert } = useReloadConfirmations(isSubmitting === "submitting");
  const { captureIssueEvent } = useEventTracker();
  const { loader } = useProjectInbox();

  useEffect(() => {
    if (isSubmitting === "submitted") {
      setShowAlert(false);
      setTimeout(async () => {
        setIsSubmitting("saved");
      }, 3000);
    } else if (isSubmitting === "submitting") {
      setShowAlert(true);
    }
  }, [isSubmitting, setShowAlert, setIsSubmitting]);

  const issue = inboxIssue.issue;
  if (!issue) return <></>;

  const issueOperations: TIssueOperations = useMemo(
    () => ({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fetch: async (workspaceSlug: string, projectId: string, issueId: string) => {
        try {
          return;
        } catch (error) {
          setToast({
            title: "Issue fetch failed",
            type: TOAST_TYPE.ERROR,
            message: "Issue fetch failed",
          });
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      remove: async (workspaceSlug: string, projectId: string, issueId: string) => {
        try {
          return;
        } catch (error) {
          setToast({
            title: "Issue remove failed",
            type: TOAST_TYPE.ERROR,
            message: "Issue remove failed",
          });
        }
      },
      update: async (workspaceSlug: string, projectId: string, issueId: string, data: Partial<TIssue>) => {
        try {
          await inboxIssue.updateIssue(data);
          captureIssueEvent({
            eventName: "Inbox issue updated",
            payload: { ...data, state: "SUCCESS", element: "Inbox" },
            updates: {
              changed_property: Object.keys(data).join(","),
              change_details: Object.values(data).join(","),
            },
            path: router.asPath,
          });
        } catch (error) {
          setToast({
            title: "Issue update failed",
            type: TOAST_TYPE.ERROR,
            message: "Issue update failed",
          });
          captureIssueEvent({
            eventName: "Inbox issue updated",
            payload: { state: "SUCCESS", element: "Inbox" },
            updates: {
              changed_property: Object.keys(data).join(","),
              change_details: Object.values(data).join(","),
            },
            path: router.asPath,
          });
        }
      },
    }),
    [inboxIssue]
  );

  if (!issue?.project_id || !issue?.id) return <></>;

  return (
    <>
      <div className="rounded-lg space-y-4 pl-3">
        <IssueTitleInput
          workspaceSlug={workspaceSlug}
          projectId={issue.project_id}
          issueId={issue.id}
          isSubmitting={isSubmitting}
          setIsSubmitting={(value) => setIsSubmitting(value)}
          issueOperations={issueOperations}
          disabled={!isEditable}
          value={issue.name}
          containerClassName="-ml-3"
        />

        {loader === "issue-loading" ? (
          <Loader className="min-h-[6rem] rounded-md border border-custom-border-200">
            <Loader.Item width="100%" height="140px" />
          </Loader>
        ) : (
          <IssueDescriptionInput
            workspaceSlug={workspaceSlug}
            projectId={issue.project_id}
            issueId={issue.id}
            swrIssueDescription={issue.description_html ?? "<p></p>"}
            initialValue={issue.description_html ?? "<p></p>"}
            disabled={!isEditable}
            issueOperations={issueOperations}
            setIsSubmitting={(value) => setIsSubmitting(value)}
            containerClassName="-ml-3 border-none"
          />
        )}

        {currentUser && (
          <IssueReaction
            workspaceSlug={workspaceSlug}
            projectId={projectId}
            issueId={issue.id}
            currentUser={currentUser}
          />
        )}
      </div>

      <div className="pl-3">
        <IssueAttachmentRoot
          workspaceSlug={workspaceSlug}
          projectId={projectId}
          issueId={issue.id}
          disabled={!isEditable}
        />
      </div>

      <InboxIssueContentProperties
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        issue={issue}
        issueOperations={issueOperations}
        isEditable={isEditable}
        duplicateIssueDetails={inboxIssue?.duplicate_issue_detail}
      />

      <div className="pb-12 pl-3">
        <IssueActivity workspaceSlug={workspaceSlug} projectId={projectId} issueId={issue.id} />
      </div>
    </>
  );
});
