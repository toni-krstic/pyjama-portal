import { SignInButton, currentUser } from "@clerk/nextjs";
import { unstable_noStore as noStore } from "next/cache";

import { CreatePost } from "~/app/_components/CreatePost";
import { Feed } from "./_components/Feed";
import { api } from "~/trpc/server";
import { redirect } from "next/navigation";

export default async function Home() {
  noStore();
  const user = await currentUser();
  const dbUser = await api.profile.getUserById.query({ id: user?.id ?? "" });
  if (dbUser.onboarding) redirect(`?onboarding=true&id=${dbUser.id}`);
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
