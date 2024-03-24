"use client";
import type { RouterOutputs } from "~/trpc/shared";
import { Following } from "./Following";
import { Feed } from "./Feed";
import { useState } from "react";
import classNames from "classnames";
type userWithFollowers = RouterOutputs["profile"]["getUserById"];
export const ChooseFeed = (props: userWithFollowers) => {
  const [feed, setFeed] = useState(true);
  return (
    <>
      <div className="flex w-full justify-between p-4">
        <div className="flex w-full items-center justify-center">
          <button
            onClick={() => setFeed(true)}
            className={`${classNames("w-36 rounded-xl p-1", { "bg-slate-700": feed })}`}
          >
            Feed
          </button>
        </div>
        <div className="flex w-full items-center justify-center">
          <button
            onClick={() => setFeed(false)}
            className={`${classNames("w-36 rounded-xl p-1", { "bg-slate-700": !feed })}`}
          >
            Following
          </button>
        </div>
      </div>
      {feed && <Feed />}
      {!feed && props && <Following {...props} />}
    </>
  );
};
