"use client";

import { api } from "~/trpc/react";
import { LoadingPage, LoadingSpinner } from "./Loader";
import { PostView } from "./PostView";
import { SharePostView } from "./SharePostView";
import InfiniteScroll from "react-infinite-scroll-component";

export function Feed() {
  const { data, status, fetchNextPage, hasNextPage } =
    api.post.getAll.useInfiniteQuery(
      { limit: 5 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      {status === "success" && (
        <InfiniteScroll
          dataLength={data?.pages.length * 5}
          next={fetchNextPage}
          hasMore={hasNextPage ?? false}
          loader={
            <div className="flex items-center justify-center p-2">
              <LoadingSpinner />
            </div>
          }
          endMessage={
            <div className="flex items-center justify-center">
              <p>No more posts.</p>
            </div>
          }
          height={screen.height}
        >
          <div className="flex flex-col gap-2">
            {data?.pages.map((page) => (
              <>
                {page.data.map((fullPost) =>
                  fullPost.isRepost ? (
                    <SharePostView {...fullPost} key={fullPost.id} />
                  ) : (
                    <PostView {...fullPost} key={fullPost.id} />
                  ),
                )}
              </>
            ))}
          </div>
        </InfiniteScroll>
      )}
    </>
  );
}
