import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import type { RouterOutputs } from "~/trpc/shared";
import Link from "next/link";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profilePicture}
        alt={`${author.username} profile picture`}
        height={56}
        width={56}
        className="h-14 w-14 rounded-full"
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <span className="font-thin">{`· ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <Link href={`/post/${post.id}`}>
          <span className="">{post.content}</span>
        </Link>
      </div>
    </div>
  );
};
