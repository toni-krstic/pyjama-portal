"use client";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Link from "next/link";

import { api } from "~/trpc/react";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

dayjs.extend(relativeTime);

export const EditPost = (props: { id: string; isModal: boolean }) => {
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const utils = api.useUtils();
  const router = useRouter();

  const { data } = api.post.getById.useQuery({ id: props.id });

  useEffect(() => {
    setContent(data?.content ?? "");
  }, [data]);

  const editPost = api.post.edit.useMutation({
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
    <article className="flex max-w-xl flex-col overflow-hidden rounded-xl bg-slate-800 p-7">
      <div className="flex w-full items-start justify-between ">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link
              href={`/@${data?.postAuthor?.username}`}
              className="relative h-11 w-11"
            >
              <Image
                src={data?.postAuthor?.profileImage ?? ""}
                alt="user_community_image"
                fill
                className="cursor-pointer rounded-full"
              />
            </Link>

            <div className="relative mt-2 w-0.5 grow rounded-full bg-slate-700" />
          </div>

          <div className="flex w-full flex-col">
            <div className="flex flex-col">
              <Link href={`/@${data?.postAuthor?.username}`} className="w-fit">
                <h4 className="flex cursor-pointer items-center gap-1">
                  {`${data?.postAuthor?.firstName} ${data?.postAuthor?.lastName}`}
                  <span className="text-xs font-thin">
                    {`· @${data?.postAuthor?.username}`}
                  </span>
                </h4>
              </Link>
              <span className="text-xs font-thin">{`${dayjs(
                data?.createdAt,
              ).fromNow()}`}</span>
            </div>

            <form
              className="mt-2 flex h-full flex-col items-start"
              onSubmit={(e) => {
                e.preventDefault();
                editPost.mutate({
                  id: props.id,
                  content: content,
                });
              }}
            >
              <textarea
                className="min-h-28 w-full break-all bg-transparent text-sm outline-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button type="submit" className="mt-2">
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </article>
  );
};
