"use client";

import { api } from "~/trpc/react";
import { LoadingPage } from "./Loader";
import { PostView } from "./PostView";

export default function ProfileFeed(props: { userId: string }) {
  const { data, isLoading } = api.post.getByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;
  if (!data || data.length === 0) return <div>no posts</div>;

  return (
    <div className="flex flex-col gap-2">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.id} />
      ))}
    </div>
  );
}
