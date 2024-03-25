import { SignInButton, currentUser } from "@clerk/nextjs";
import { unstable_noStore as noStore } from "next/cache";

import { CreatePost } from "~/app/_components/CreatePost";
import { Feed } from "./_components/Feed";
import { api } from "~/trpc/server";
import { redirect } from "next/navigation";
import { ChooseFeed } from "./_components/ChooseFeed";

export default async function Home() {
  noStore();
  const user = await currentUser();
  const dbUser = await api.profile.getUserById.query({ id: user?.id ?? "" });
  if (dbUser && dbUser.onboarding) redirect(`/onboarding?id=${dbUser.id}`);

  return (
    <section className="p-8">
      <div className="my-2">
        {!dbUser && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {dbUser && <CreatePost />}
      </div>
      {dbUser && <ChooseFeed {...dbUser} />}
      {!dbUser && <Feed />}
    </section>
  );
}
