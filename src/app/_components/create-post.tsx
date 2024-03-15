"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "./ui/use-toast";

import { api } from "~/trpc/react";
import { LoadingPage } from "./Loader";

export function CreatePost() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const { user, isLoaded } = useUser();
  const { toast } = useToast();

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      setContent("");
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

  if (!isLoaded) return <LoadingPage />;
  if (!user) return null;

  return (
    <>
      <div className="flex w-full gap-3">
        <Image
          src={user.imageUrl}
          alt="Profile Image"
          className="h-14 w-14 rounded-full"
          height={56}
          width={56}
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
            placeholder="Type some text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full grow bg-transparent outline-none"
            disabled={createPost.isLoading}
          />
          <button
            type="submit"
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
            disabled={createPost.isLoading}
          >
            {createPost.isLoading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </>
  );
}
