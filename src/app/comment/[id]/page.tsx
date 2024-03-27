import type { Metadata } from "next";
import { CommentView } from "~/app/_components/CommentView";
import { CreateCommentInput } from "~/app/_components/CreateCommentInput";
import { api } from "~/trpc/server";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

  const data = await api.post.getCommentById.query({ id });

  return {
    title: `${data?.content} - @${data?.commentAuthor?.username}`,
  };
}

export default async function SingleCommentPage({ params }: Props) {
  const id = params.id;
  const data = await api.post.getCommentById.query({ id });

  if (!data) return null;

  return (
    <section className="flex h-full max-w-xl flex-col p-8">
      <div>
        <CommentView {...data} />
      </div>

      <div className="mt-7">
        <CreateCommentInput
          originalPostId={data.originalPostId}
          originalCommentId={data.originialCommentId ?? data.id}
          parentCommentId={data.id}
          isModal={false}
        />
      </div>

      <div className="mt-10">
        {data.childComments.map((comment) => {
          if (comment.parentCommentId === data.id) {
            let childComments: typeof data.childComments = [];
            childComments = comment.childComments.map((item) => {
              return {
                ...item,
                childComments: childComments,
                commentLikes: [],
                commentShares: [],
                commentAuthor: { ...comment.commentAuthor },
              };
            });
            return (
              <CommentView
                {...comment}
                childComments={childComments}
                key={comment.id}
              />
            );
          }
        })}
      </div>
    </section>
  );
}
