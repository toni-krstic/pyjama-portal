"use client";

import { api } from "~/trpc/react";

import { LoadingPage, LoadingSpinner } from "./Loader";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";
import { NotificationCard } from "./NotificationCard";

export const NotificationCards = (props: { id: string }) => {
  const { data, status, fetchNextPage, hasNextPage } =
    api.profile.getNotifications.useInfiniteQuery(
      { limit: 25, id: props.id },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  if (status === "loading") return <LoadingPage />;
  if (!data) return <div>No Result</div>;
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
              {data.pages[0]?.data.length && data.pages[0]?.data.length < 25 ? (
                "No more notifications"
              ) : (
                <LoadingSpinner />
              )}
            </div>
          }
          endMessage={
            <div className="flex items-center justify-center p-2">
              <p>
                {data.pages[0]?.data.length === 0
                  ? "No activity yet"
                  : "No more notifications"}
              </p>
            </div>
          }
          className="h-fit"
        >
          <div className="mt-10 flex flex-col gap-5">
            {data?.pages.map((page) => (
              <>
                {page.data.map((notification) => {
                  if (notification.postId)
                    return (
                      <Link
                        key={notification.id}
                        href={`/post/${notification.postId}`}
                      >
                        <NotificationCard
                          id={notification.authorId}
                          text={notification.content}
                          createdAt={notification.createdAt}
                        />
                      </Link>
                    );
                  else if (notification.commentId)
                    return (
                      <Link
                        key={notification.id}
                        href={`/comment/${notification.commentId}`}
                      >
                        <NotificationCard
                          id={notification.authorId}
                          text={notification.content}
                          createdAt={notification.createdAt}
                        />
                      </Link>
                    );
                  else
                    return (
                      <NotificationCard
                        key={notification.id}
                        id={notification.authorId}
                        text={notification.content}
                        createdAt={notification.createdAt}
                      />
                    );
                })}
              </>
            ))}
          </div>
        </InfiniteScroll>
      )}
    </>
  );
};
