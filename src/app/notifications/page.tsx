import { currentUser } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

import { NotificationCards } from "../_components/NotificationCards";

export default async function Notifications() {
  const user = await currentUser();
  const dbUser = await api.profile.getUserById.query({ id: user?.id ?? "" });
  if (!dbUser) return null;
  if (dbUser && dbUser.onboarding) redirect(`/onboarding?id=${dbUser.id}`);

  return (
    <section className="p-8">
      <h1 className="">Notifications</h1>
      <NotificationCards id={dbUser.id} />
    </section>
  );
}
