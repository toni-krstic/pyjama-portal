"use client";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import type { RouterOutputs } from "~/trpc/shared";
import Link from "next/link";
import { FaRegComment, FaRegHeart, FaRegShareSquare } from "react-icons/fa";

import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";

dayjs.extend(relativeTime);
type Comment = RouterOutputs["post"]["getCommentById"];
export const CommentView = (props: Comment) => {
  const user = useUser();
  const { toast } = useToast();
  const utils = api.useUtils();
  const router = useRouter();

  const likePost = api.post.like.useMutation({
    onSuccess: () => {
      void utils.post.getAll.invalidate();
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage) {
        toast({
          title: "Error",
          description: errorMessage[0],
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong, please try again",
        });
      }
    },
  });
  return (
    <div className="flex gap-3 overflow-hidden rounded-lg bg-slate-800 p-4">
      <Image
        src={props?.commentAuthor.profileImage ?? ""}
        alt={`${props?.commentAuthor.username}'s profile picture`}
        height={56}
        width={56}
        className="h-14 w-14 rounded-full"
      />
      <div className="flex w-full flex-col gap-4 overflow-hidden p-2">
        <div className="flex flex-col text-slate-300">
          <Link href={`/@${props?.commentAuthor.username}`}>
            <span>{`@${props?.commentAuthor.username}`}</span>
          </Link>
          <span className="text-sm font-thin">{`${dayjs(props?.createdAt).fromNow()}`}</span>
        </div>
        <Link href={`/post/${props?.id}`} className="">
          <span className="">{props?.content}</span>
        </Link>
        <div className="flex w-full items-center justify-between text-slate-300">
          <div
            className="flex cursor-pointer items-center justify-center gap-1 hover:text-slate-500"
            onClick={() =>
              router.push(
                `?createComment=true&id=${props?.originalPostId}&parentCommentId=${props?.parentCommentId}`,
              )
            }
          >
            <FaRegComment />
          </div>
          <div
            className="flex cursor-pointer items-center justify-center gap-1 hover:text-red-500"
            onClick={() =>
              likePost.mutate({
                authorId: user.user?.id ?? "",
                postId: props?.id ?? "",
              })
            }
          >
            <FaRegHeart />
            <span>{props?.numLikes}</span>
          </div>
          <div className="flex cursor-pointer items-center justify-center gap-1 hover:text-slate-500">
            <FaRegShareSquare />
          </div>
        </div>
      </div>
    </div>
  );
};
