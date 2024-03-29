"use client";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Link from "next/link";

import { api } from "~/trpc/react";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { PostView } from "./PostView";
import { useUser } from "@clerk/nextjs";
import type { RouterOutputs } from "~/trpc/shared";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { BsThreeDots } from "react-icons/bs";
import LinkPreview from "./LinkPreview";
import { FaRegComment, FaRegHeart, FaRegShareSquare } from "react-icons/fa";
import classNames from "classnames";

dayjs.extend(relativeTime);

type fullPost = RouterOutputs["post"]["getById"];
export const SharePostView = (props: fullPost) => {
  const { toast } = useToast();
  const utils = api.useUtils();
  const router = useRouter();
  const user = useUser();
  const isAuthor = props?.authorId === user.user?.id;
  const isLiked = props?.likes.some((like) => like.authorId === user?.user?.id);
  const link = props?.content?.match(/\b(?:https?|ftp):\/\/\S+/gi) ?? "";

  const { data } = api.post.getById.useQuery({
    id: props?.originalPostId ?? "",
  });

  const likePost = api.post.like.useMutation({
    onSuccess: () => {
      void utils.post.getAll.invalidate();
      void utils.post.getCommentById.invalidate();
      void utils.post.getByUserId.invalidate();
      void utils.post.getById.invalidate();
      void utils.post.getFollowing.invalidate();
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

  const deletePost = api.post.delete.useMutation({
    onSuccess: () => {
      void utils.post.getAll.invalidate();
      void utils.post.getCommentById.invalidate();
      void utils.post.getByUserId.invalidate();
      void utils.post.getById.invalidate();
      void utils.post.getFollowing.invalidate();
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

  if (!data) return null;

  return (
    <article className="flex w-full flex-col overflow-hidden rounded-xl bg-slate-800 p-7">
      <div className="flex w-full items-start justify-between ">
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
            <div className="flex flex-col">
              <div className="flex w-full justify-between">
                <Link
                  href={`/@${props?.postAuthor?.username}`}
                  className="w-fit"
                >
                  <h4 className="flex cursor-pointer items-center gap-1">
                    {`${props?.postAuthor?.firstName} ${props?.postAuthor?.lastName}`}
                    <span className="text-xs font-thin">
                      {`· @${props?.postAuthor?.username}`}
                    </span>
                  </h4>
                </Link>
                {isAuthor && (
                  <Popover>
                    <PopoverTrigger>
                      <BsThreeDots />
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="flex w-full flex-col items-start gap-2">
                        <button
                          onClick={() =>
                            router.push(`?edit=true&id=${props?.id}`)
                          }
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            deletePost.mutate({ id: props?.id ?? "" })
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <span className="text-xs font-thin">{`${dayjs(
                props?.createdAt,
              ).fromNow()}`}</span>
            </div>

            <div className="mt-2">
              <p className="break-all text-sm">{props?.content}</p>
              {link && (
                <div className="mt-4">
                  <LinkPreview url={link[0]} />
                </div>
              )}
            </div>

            <PostView {...data} />

            <div className="mt-5 flex flex-col gap-3">
              <div className="flex gap-3.5">
                <FaRegHeart
                  className={`${classNames("cursor-pointer", { "hover:text-red-500": !isLiked, "text-red-500": isLiked })}`}
                  onClick={() =>
                    likePost.mutate({
                      authorId: user.user?.id ?? "",
                      postId: props?.id ?? "",
                    })
                  }
                />
                <Link href={`?comment=true&id=${props?.id}`}>
                  <FaRegComment className="hover:text-blue-500" />
                </Link>
                <Link href={`?share=true&id=${props?.id}`}>
                  <FaRegShareSquare className="hover:text-green-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ml-1 mt-3 flex items-center gap-2">
        {props && props.comments.length > 0 && (
          <>
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
          </>
        )}
        <Link href={`/post/${props?.id}`}>
          <p className="mt-1 text-sm font-extralight">
            {`${props?.numComments} ${props?.numComments === 1 ? "reply" : "relpies"} · ${props?.numLikes} ${props?.numLikes === 1 ? "like" : "likes"}`}
          </p>
        </Link>
      </div>
    </article>
  );
};
