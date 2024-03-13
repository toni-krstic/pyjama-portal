import { SignInButton, UserButton, currentUser } from "@clerk/nextjs";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

import { CreatePost } from "~/app/_components/create-post";
import { api } from "~/trpc/server";
import { Posts } from "./_components/Posts";

export default async function Home() {
  noStore();
  const hello = await api.post.hello.query({ text: "from tRPC" });
  const user = await currentUser();

  return (
    <main className="flex h-screen justify-center">
      <div className="h-full  w-full border-x border-slate-400 md:max-w-2xl">
        <div className="border-b border-slate-400 p-4 ">
          {!user && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
          {!!user && <CreatePost />}
        </div>

        <Posts />
      </div>
    </main>
  );
}

async function CrudShowcase() {
  const latestPost = await api.post.getLatest.query();

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}

      <CreatePost />
    </div>
  );
}
