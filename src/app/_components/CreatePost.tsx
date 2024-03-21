"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useToast } from "./ui/use-toast";

import { api } from "~/trpc/react";
import { LoadingPage, LoadingSpinner } from "./Loader";

export function CreatePost() {
  const [content, setContent] = useState("");
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const utils = api.useUtils();

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      setContent("");
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

  if (!isLoaded) return <LoadingPage />;
  if (!user) return null;

  return (
    <>
      <div className="flex w-full gap-3 rounded-lg bg-slate-800 p-4">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "h-14 w-14",
            },
          }}
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createPost.mutate({ content });
          }}
          className="flex w-full gap-2"
        >
          <input
            type="text"
            placeholder="What is happening?!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full grow bg-transparent outline-none"
            disabled={createPost.isLoading}
          />
          <button
            type="submit"
            className="bg-transparent p-2"
            disabled={createPost.isLoading}
          >
            {createPost.isLoading ? <LoadingSpinner /> : "Post"}
          </button>
        </form>
      </div>
    </>
  );
}
