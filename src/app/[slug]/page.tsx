import type { Metadata } from "next";
import Image from "next/image";
import { api } from "~/trpc/server";
import ProfileFeed from "../_components/ProfileFeed";
import { currentUser } from "@clerk/nextjs/server";
import { FollowButton } from "../_components/FollowButton";

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
  const user = await currentUser();

  if (!data ?? !user) return null;
  return (
    <section className="pb-20 sm:px-8 sm:pb-0">
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
      <div className="p-4 text-2xl font-bold">
        {`${data.firstName} ${data.lastName} `}
        <span className="text-sm font-thin">{`· @${data.username}`}</span>
        <FollowButton {...data} />
      </div>
      <div className="p-4 text-lg font-thin">
        <span>{data.bio}</span>
      </div>
      <div className="p-4 ">
        <span className=" font-normal">
          {data.following.length}{" "}
          <span className="text-sm font-thin">following</span>
        </span>
        {"  "}
        <span className=" font-normal">
          {data.followers.length}{" "}
          <span className="text-sm font-thin">followers</span>
        </span>
      </div>
      <div className="mb-2 w-full"></div>
      <ProfileFeed userId={data.id} />
    </section>
  );
}
