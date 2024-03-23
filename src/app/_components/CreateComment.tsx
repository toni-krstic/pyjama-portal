"use client";

import { api } from "~/trpc/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage } from "./Loader";
import { PostView } from "./PostView";
import { CommentView } from "./CommentView";
import { CreateCommentInput } from "./CreateCommentInput";

dayjs.extend(relativeTime);

export const CreateComment = (props: {
  id: string;
  parentCommentId: string;
  isComment: boolean;
}) => {
  const { id, parentCommentId, isComment } = props;
  const { data, isLoading } = api.post.getFullPostById.useQuery({ id });

  if (isLoading) return <LoadingPage />;
  if (!data) return null;
  return (
    <section className="flex h-full max-w-xl flex-col justify-center">
      <div>
        <PostView {...data} />
      </div>
      {isComment && (
        <div className="mt-7 p-7">
          {data.comments.map((comment) => {
            if (comment.id === parentCommentId)
              return <CommentView {...comment} key={comment.id} />;
          })}
        </div>
      )}
      <div className="mt-7">
        <CreateCommentInput
          originalPostId={id}
          parentCommentId={parentCommentId}
          isModal={true}
        />
      </div>
    </section>
  );
};
