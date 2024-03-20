import { Metadata } from "next";
import { PostView } from "~/app/_components/PostView";
import { api } from "~/trpc/server";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;

  const [data] = await api.post.getById.query({ id });

  return {
    title: `${data?.post.content} - @${data?.author.username}`,
  };
}

export default async function SinglePostPage({ params }: Props) {
  const id = params.id;
  const [data] = await api.post.getById.query({ id });

  if (!data) return null;

  return <PostView {...data} />;
}
