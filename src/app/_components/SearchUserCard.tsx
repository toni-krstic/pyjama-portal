"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { RouterOutputs } from "~/trpc/shared";

type SearchUser = RouterOutputs["profile"]["search"]["data"][number];
export const SearchUserCard = (props: SearchUser) => {
  const router = useRouter();

  return (
    <article className="flex flex-col justify-between gap-4 max-sm:rounded-xl max-sm:p-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-start justify-start gap-3 sm:items-center">
        <div className="relative h-12 w-12">
          <Image
            src={props.profileImage ?? ""}
            alt="user_logo"
            fill
            className="rounded-full object-cover"
          />
        </div>

        <div className="flex-1 text-ellipsis">
          <h4 className="">{props.firstName}</h4>
          <p className="">{`@${props.username}`}</p>
        </div>
      </div>

      <button
        className="h-auto min-w-[74px] rounded-lg text-[12px]"
        onClick={() => {
          router.push(`/@${props.username}`);
        }}
      >
        View
      </button>
    </article>
  );
};
