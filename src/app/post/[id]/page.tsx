import type { Metadata } from "next";
import { CommentView } from "~/app/_components/CommentView";
import { PostView } from "~/app/_components/PostView";
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
  const data = await api.post.getFullPostById.query({ id });

  if (!data) return null;

  return (
    <div className="flex flex-col gap-2 p-8">
      <PostView {...data} />
      {data.comments.map((comment) => (
        <CommentView {...comment} key={comment.id} />
      ))}
    </div>
  );
}
