"use client";

import { api } from "~/trpc/react";
import { LoadingPage, LoadingSpinner } from "./Loader";
import { PostView } from "./PostView";
import { SharePostView } from "./SharePostView";
import InfiniteScroll from "react-infinite-scroll-component";

export function Feed() {
  const { data, status, fetchNextPage, hasNextPage } =
    api.post.getAll.useInfiniteQuery(
      { limit: 25 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  if (status === "loading") return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      {status === "success" && (
        <InfiniteScroll
          dataLength={data?.pages.length * 25}
          next={fetchNextPage}
          hasMore={hasNextPage ?? false}
          scrollableTarget="layout"
          loader={
            <div className="flex items-center justify-center p-2">
              <LoadingSpinner />
            </div>
          }
          endMessage={
            <div className="flex items-center justify-center p-2">
              <p>No more posts</p>
            </div>
          }
          className="h-fit"
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
