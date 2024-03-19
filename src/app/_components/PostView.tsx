import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import type { RouterOutputs } from "~/trpc/shared";
import Link from "next/link";
import { FaRegComment, FaRegHeart, FaRegShareSquare } from "react-icons/fa";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex gap-3 overflow-hidden rounded-lg bg-slate-800 p-4">
      <Image
        src={author.profilePicture}
        alt={`${author.username} profile picture`}
        height={56}
        width={56}
        className="h-14 w-14 rounded-full"
      />
      <div className="flex w-full flex-col gap-4 overflow-hidden p-2">
        <div className="flex flex-col text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <span className="text-sm font-thin">{`${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <Link href={`/post/${post.id}`} className="">
          <span className="">{post.content}</span>
        </Link>
        <div className="flex w-full items-center justify-between text-slate-300">
          <FaRegComment />
          <FaRegHeart />
          <FaRegShareSquare />
        </div>
      </div>
    </div>
  );
};
