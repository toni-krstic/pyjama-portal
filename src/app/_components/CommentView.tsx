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

  const likeComment = api.post.likeComment.useMutation({
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
    <article className="xs:px-7 flex w-full flex-col rounded-xl px-0">
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link
              href={`/@${props?.commentAuthor?.username}`}
              className="relative h-11 w-11"
            >
              <Image
                src={props?.commentAuthor?.profileImage ?? ""}
                alt={`@${props?.commentAuthor?.username}'s profile pictur`}
                fill
                className="cursor-pointer rounded-full"
              />
            </Link>

            <div className="relative mt-2 w-0.5 grow rounded-full bg-slate-700" />
          </div>

          <div className="flex w-full flex-col">
            <div className="flex flex-col">
              <Link
                href={`/@${props?.commentAuthor?.username}`}
                className="w-fit"
              >
                <h4 className="flex cursor-pointer items-center gap-1">
                  {`${props?.commentAuthor?.firstName} ${props?.commentAuthor?.lastName}`}
                  <span className="text-xs font-thin">
                    {`· @${props?.commentAuthor?.username}`}{" "}
                  </span>
                </h4>
              </Link>
              <span className="text-xs font-thin">{`${dayjs(
                props?.createdAt,
              ).fromNow()}`}</span>
            </div>

            <Link href={`/comment/${props?.id}`}>
              <p className="text-small-regular text-light-2 mt-2">
                {props?.content}
              </p>
            </Link>

            <div className="mb-10 mt-5 flex flex-col gap-3">
              <div className="flex gap-3.5">
                <FaRegHeart
                  className="cursor-pointer hover:text-red-500"
                  onClick={() =>
                    likeComment.mutate({
                      authorId: user.user?.id ?? "",
                      commentId: props?.id ?? "",
                    })
                  }
                />
                <Link
                  href={`?comment=true&id=${props?.originalPostId}&parentCommentId=${props?.id}&isComment=true`}
                >
                  <FaRegComment className="hover:text-blue-500" />
                </Link>
              </div>

              <Link href={`/comment/${props?.id}`}>
                <p className="mt-1 text-sm font-extralight">
                  {`${props?.childComments.length} ${props?.childComments.length === 1 ? "reply" : "relpies"} · ${props?.numLikes} ${props?.numLikes === 1 ? "like" : "likes"}`}
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
