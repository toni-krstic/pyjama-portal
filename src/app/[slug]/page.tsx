import { Metadata } from "next";
import { api } from "~/trpc/server";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = params.slug.replace("%40", "");
  console.log("slug metadata: ", username);

  const data = await api.profile.getUserByUsername.query({ username });

  return {
    title: `@${data.username}`,
    description: `@${data.username} - Profile Page`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const username = params.slug.replace("%40", "");
  const data = await api.profile.getUserByUsername.query({
    username,
  });

  if (!data) return null;
  return (
    <>
      <main className="flex h-screen justify-center">
        <div>{data.username}</div>
      </main>
    </>
  );
}
