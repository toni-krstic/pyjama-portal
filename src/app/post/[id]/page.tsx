import type { Metadata } from "next";
import { CommentView } from "~/app/_components/CommentView";
import { CreateCommentInput } from "~/app/_components/CreateCommentInput";
import { PostView } from "~/app/_components/PostView";
import { SharePostView } from "~/app/_components/SharePostView";
import { api } from "~/trpc/server";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

  const data = await api.post.getById.query({ id });

  return {
    title: `${data?.content} - @${data?.postAuthor?.username}`,
  };
}

export default async function SinglePostPage({ params }: Props) {
  const id = params.id;
  const data = await api.post.getById.query({ id });

  if (!data) return null;

  return (
    <section className="flex h-full max-w-xl flex-col p-8">
      <div>
        {data.isRepost ? <SharePostView {...data} /> : <PostView {...data} />}
      </div>

      <div className="mt-7">
        <CreateCommentInput
          originalPostId={id}
          parentCommentId={""}
          originalCommentId={""}
          isModal={false}
        />
      </div>

      <div className="mt-10">
        {data.comments.map((comment) => {
          if (comment.parentCommentId === null)
            return <CommentView {...comment} key={comment.id} />;
        })}
      </div>
    </section>
  );
}
