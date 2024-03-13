import { SignInButton, currentUser } from "@clerk/nextjs";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

import { CreatePost } from "~/app/_components/create-post";
import { api } from "~/trpc/server";
import { Posts } from "./_components/Posts";

export default async function Home() {
  noStore();
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
