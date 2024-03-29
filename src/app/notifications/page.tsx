import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { NotificationCard } from "../_components/NotificationCard";

export default async function Notifications() {
  const user = await currentUser();
  const dbUser = await api.profile.getUserById.query({ id: user?.id ?? "" });
  if (!dbUser) return null;
  if (dbUser && dbUser.onboarding) redirect(`/onboarding?id=${dbUser.id}`);

  const data = await api.profile.getNotifications.query({ id: dbUser.id });

  return (
    <section className="p-8">
      <h1 className="">Notifications</h1>

      <div className="mt-10 flex flex-col gap-5">
        {data.length > 0 ? (
          <>
            {data.map((notification) => {
              if (notification.postId)
                return (
                  <Link
                    key={notification.postId}
                    href={`/post/${notification.postId}`}
                  >
                    <NotificationCard
                      id={notification.authorId}
                      text={notification.content}
                      createdAt={notification.createdAt}
                    />
                  </Link>
                );
              else if (notification.commentId)
                return (
                  <Link
                    key={notification.commentId}
                    href={`/comment/${notification.commentId}`}
                  >
                    <NotificationCard
                      id={notification.authorId}
                      text={notification.content}
                      createdAt={notification.createdAt}
                    />
                  </Link>
                );
              else
                return (
                  <NotificationCard
                    key={notification.id}
                    id={notification.authorId}
                    text={notification.content}
                    createdAt={notification.createdAt}
                  />
                );
            })}
          </>
        ) : (
          <p>No activity yet</p>
        )}
      </div>
    </section>
  );
}
