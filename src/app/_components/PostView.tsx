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

type fullPost = RouterOutputs["post"]["getFullPostById"];
export const PostView = (props: fullPost) => {
  const user = useUser();
  const { toast } = useToast();
  const utils = api.useUtils();
  const router = useRouter();

  const likePost = api.post.like.useMutation({
    onSuccess: () => {
      void utils.post.getAll.invalidate();
      void utils.post.getFullPostById.invalidate();
      void utils.post.getCommentById.invalidate();
      void utils.post.getByUserId.invalidate();
      void utils.post.getById.invalidate();
      router.refresh();
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
    <article className="flex w-full flex-col rounded-xl bg-slate-800 p-7">
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link
              href={`/@${props?.postAuthor?.username}`}
              className="relative h-11 w-11"
            >
              <Image
                src={props?.postAuthor?.profileImage ?? ""}
                alt="user_community_image"
                fill
                className="cursor-pointer rounded-full"
              />
            </Link>

            <div className="relative mt-2 w-0.5 grow rounded-full bg-slate-700" />
          </div>

          <div className="flex w-full flex-col">
            <Link href={`/@${props?.postAuthor?.username}`} className="w-fit">
              <h4 className="text-base-semibold text-light-1 cursor-pointer">
                {props?.postAuthor?.username}
              </h4>
            </Link>

            <Link href={`/post/${props?.id}`}>
              <p className="text-small-regular text-light-2 mt-2">
                {props?.content}
              </p>
            </Link>

            <div className="mt-5 flex flex-col gap-3">
              <div className="flex gap-3.5">
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
                <Link
                  href={`?comment=true&id=${props?.id}`}
                  className="flex items-center justify-center"
                >
                  <FaRegComment />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {props?.numComments && props.numComments > 0 && (
        <div className="ml-1 mt-3 flex items-center gap-2">
          {props.comments.slice(0, 2).map((comment, index) => (
            <Image
              key={index}
              src={comment.commentAuthor.profileImage ?? ""}
              alt={`user_${index}`}
              width={24}
              height={24}
              className={`${index !== 0 && "-ml-5"} rounded-full object-cover`}
            />
          ))}

          <Link href={`/post/${props?.id}`}>
            <p className="text-subtle-medium text-gray-1 mt-1">
              {props.numComments} repl{props.numComments > 1 ? "ies" : "y"}
            </p>
          </Link>
        </div>
      )}
    </article>
  );
};
