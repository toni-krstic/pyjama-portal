import { SignInButton, currentUser } from "@clerk/nextjs";
import { unstable_noStore as noStore } from "next/cache";

import { CreatePost } from "~/app/_components/CreatePost";
import { Feed } from "./_components/Feed";

export default async function Home() {
  noStore();
  const user = await currentUser();

  return (
    <>
      <div className="my-2">
        {!user && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {!!user && <CreatePost />}
      </div>
      <Feed />
    </>
  );
}
