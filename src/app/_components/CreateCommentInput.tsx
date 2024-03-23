"use client";
import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

export const CreateCommentInput = (props: {
  originalPostId: string;
  parentCommentId: string;
  isModal: boolean;
}) => {
  const { originalPostId, parentCommentId, isModal } = props;
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const utils = api.useUtils();
  const router = useRouter();
  const { user } = useUser();

  const createComment = api.post.comment.useMutation({
    onSuccess: () => {
      setContent("");
      void utils.post.getAll.invalidate();
      void utils.post.getFullPostById.invalidate();
      void utils.post.getCommentById.invalidate();
      void utils.post.getByUserId.invalidate();
      void utils.post.getById.invalidate();
      isModal && router.back();
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
    <form
      className="mt-4 flex items-center gap-4 border-y p-5"
      onSubmit={(e) => {
        e.preventDefault();
        createComment.mutate({
          content,
          originalPostId: originalPostId ?? "",
          authorId: user?.id ?? "",
          parentCommentId: parentCommentId ?? "",
        });
      }}
    >
      <div className="flex w-full items-center gap-3">
        <label>
          <Image
            src={user?.imageUrl ?? ""}
            alt="current_user"
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        </label>
        <input
          type="text"
          placeholder="Comment..."
          className="bg-transparent outline-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <button type="submit">Reply</button>
    </form>
  );
};
