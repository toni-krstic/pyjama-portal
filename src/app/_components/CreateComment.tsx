"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "~/trpc/react";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useToast } from "./ui/use-toast";
import { LoadingSpinner } from "./Loader";

dayjs.extend(relativeTime);

export const CreateComment = (props: {
  id: string;
  parentCommentId: string;
}) => {
  const [content, setContent] = useState("");
  const { user } = useUser();
  const { toast } = useToast();
  const utils = api.useUtils();
  const router = useRouter();
  const { id, parentCommentId } = props;
  const { data } = api.post.getById.useQuery({ id });

  const createComment = api.post.comment.useMutation({
    onSuccess: () => {
      setContent("");
      void utils.post.getAll.invalidate();
      void utils.post.getFullPostById.invalidate();
      void utils.post.getCommentById.invalidate();
      void utils.post.getByUserId.invalidate();
      void utils.post.getById.invalidate();
      router.back();
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
    <div className="w-2xl flex flex-col rounded-lg bg-slate-800 p-4">
      <span onClick={() => router.back()} className="cursor-pointer">
        X
      </span>
      <div className="flex w-full gap-3 overflow-hidden ">
        <Image
          src={data.postAuthor?.profileImage ?? ""}
          alt={`${data.postAuthor?.username}'s profile picture`}
          height={56}
          width={56}
          className="h-14 w-14 rounded-full"
        />
        <div className="flex w-full flex-col gap-4 overflow-hidden p-2">
          <div className="flex flex-col text-slate-300">
            <Link href={`/@${data.postAuthor?.username}`}>
              <span>{`@${data.postAuthor?.username}`}</span>
            </Link>
            <span className="text-sm font-thin">{`${dayjs(data.createdAt).fromNow()}`}</span>
          </div>
          <Link href={`/post/${data.id}`} className="">
            <span className="">{data.content}</span>
          </Link>
        </div>
      </div>
      <div className="flex w-full gap-4">
        <Image
          src={user?.imageUrl ?? ""}
          alt={`${user?.username}'s profile picture`}
          height={56}
          width={56}
          className="h-14 w-14 rounded-full"
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createComment.mutate({
              content,
              originalPostId: id ?? "",
              authorId: user?.id ?? "",
              parentCommentId: parentCommentId ?? "",
            });
          }}
          className="flex w-full gap-2"
        >
          <input
            type="text"
            placeholder="Comment"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full grow bg-transparent outline-none"
            disabled={createComment.isLoading}
          />
          <button
            type="submit"
            className="bg-transparent p-2"
            disabled={createComment.isLoading}
          >
            {createComment.isLoading ? <LoadingSpinner /> : "Comment"}
          </button>
        </form>
      </div>
    </div>
  );
};