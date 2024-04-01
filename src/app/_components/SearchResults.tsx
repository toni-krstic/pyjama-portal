"use client";

import { api } from "~/trpc/react";
import { SearchUserCard } from "./SearchUserCard";
import { LoadingPage, LoadingSpinner } from "./Loader";
import InfiniteScroll from "react-infinite-scroll-component";

export const SearchResults = (props: { searchTerm: string }) => {
  const { data, status, fetchNextPage, hasNextPage } =
    api.profile.search.useInfiniteQuery(
      { limit: 25, searchTerm: props.searchTerm },
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
                "No more results"
              ) : (
                <LoadingSpinner />
              )}
            </div>
          }
          endMessage={
            <div className="flex items-center justify-center p-2">
              <p>
                {data.pages[0]?.data.length === 0
                  ? "No results"
                  : "No more results"}
              </p>
            </div>
          }
          className="h-fit"
        >
          <div className="mt-14 flex flex-col gap-9">
            {data?.pages.map((page) => (
              <>
                {page.data.map((user) => (
                  <SearchUserCard key={user.id} {...user} />
                ))}
              </>
            ))}
          </div>
        </InfiniteScroll>
      )}
    </>
  );
};
