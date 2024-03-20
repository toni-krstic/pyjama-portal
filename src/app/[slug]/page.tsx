import type { Metadata } from "next";
import Image from "next/image";
import { api } from "~/trpc/server";
import ProfileFeed from "../_components/ProfileFeed";

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
      <div className="relative h-48 bg-slate-600">
        <Image
          src={data.profileImage ?? ""}
          alt={`@${data.username}'s profile picture`}
          height={128}
          width={128}
          className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black"
        />
      </div>
      <div className="h-[64px]"></div>
      <div className="p-4 text-2xl font-bold">{`@${data.username}`}</div>
      <div className="mb-2 w-full"></div>
      <ProfileFeed userId={data.id} />
    </>
  );
}
