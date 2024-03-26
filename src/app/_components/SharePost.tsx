"use client";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Link from "next/link";

import { api } from "~/trpc/react";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PostView } from "./PostView";
import { useUser } from "@clerk/nextjs";

dayjs.extend(relativeTime);

export const SharePost = (props: { id: string; isModal: boolean }) => {
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const utils = api.useUtils();
  const router = useRouter();
  const user = useUser();
  const { data: dbUser } = api.profile.getUserById.useQuery({
    id: user.user?.id ?? "",
  });
  const { data } = api.post.getById.useQuery({ id: props.id });

  const sharePost = api.post.share.useMutation({
    onSuccess: () => {
      setContent("");
      void utils.post.getAll.invalidate();
      void utils.post.getCommentById.invalidate();
      void utils.post.getByUserId.invalidate();
      void utils.post.getById.invalidate();
      void utils.post.getFollowing.invalidate();
      props.isModal && router.back();
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
            <Link href={`/@${dbUser?.username}`} className="relative h-11 w-11">
              <Image
                src={dbUser?.profileImage ?? ""}
                alt="user_community_image"
                fill
                className="cursor-pointer rounded-full"
              />
            </Link>

            <div className="relative mt-2 w-0.5 grow rounded-full bg-slate-700" />
          </div>

          <div className="flex w-full flex-col">
            <div className="flex flex-col">
              <Link href={`/@${dbUser?.username}`} className="w-fit">
                <h4 className="flex cursor-pointer items-center gap-1">
                  {`${dbUser?.firstName} ${dbUser?.lastName}`}
                  <span className="text-xs font-thin">
                    {`· @${dbUser?.username}`}
                  </span>
                </h4>
              </Link>
            </div>
            <form
              className="mt-2 flex h-full flex-col items-start"
              onSubmit={(e) => {
                e.preventDefault();
                sharePost.mutate({
                  originalPostId: props.id,
                  content: content,
                  commentId: "",
                  authorId: dbUser?.id ?? "",
                });
              }}
            >
              <input
                className="w-full break-all bg-transparent text-sm outline-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="mt-2">
                <PostView {...data} />
              </div>
              <button type="submit" className="mt-2">
                Share
              </button>
            </form>
          </div>
        </div>
      </div>
    </article>
  );
};
