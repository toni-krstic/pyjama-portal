"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "~/trpc/react";

export function CreatePost() {
  const router = useRouter();
  const [name, setName] = useState("");
  const { user } = useUser();

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      router.refresh();
      setName("");
    },
  });
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
            createPost.mutate({ name, author: user.id });
          }}
          className="flex w-full gap-2"
        >
          <input
            type="text"
            placeholder="Type some text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full grow bg-transparent outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
            disabled={createPost.isLoading}
          >
            {createPost.isLoading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </>
  );
}
