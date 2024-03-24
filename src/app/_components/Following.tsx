"use client";

import { api } from "~/trpc/react";
import { LoadingPage } from "./Loader";
import { PostView } from "./PostView";
import type { RouterOutputs } from "~/trpc/shared";

type userWithFollowers = RouterOutputs["profile"]["getUserById"];
export function Following(props: userWithFollowers) {
  const following = props?.following.map((follow) => follow.followingId) ?? [];

  const { data, isLoading } = api.post.getFollowing.useQuery({ following });

  if (isLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col gap-2">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.id} />
      ))}
    </div>
  );
}
