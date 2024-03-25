import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
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
            {data.map((post) => {
              if (post.likes.length > 0)
                return (
                  <>
                    {post.likes.map((like) => (
                      <Link key={like.postId} href={`/post/${like.postId}`}>
                        <NotificationCard
                          id={like.authorId}
                          text="liked your post"
                          createdAt={like.createdAt}
                        />
                      </Link>
                    ))}
                  </>
                );
              if (post.shares.length > 0)
                return (
                  <>
                    {post.shares.map((share) => (
                      <Link
                        key={share.id}
                        href={`/post/${share.originalPostId}`}
                      >
                        <NotificationCard
                          id={share.authorId}
                          text="shared your post"
                          createdAt={share.createdAt}
                        />
                      </Link>
                    ))}
                  </>
                );
              if (post.comments.length > 0)
                return (
                  <>
                    {post.comments.map((comment) => (
                      <Link
                        key={comment.id}
                        href={`/post/${comment.originalPostId}`}
                      >
                        <NotificationCard
                          id={comment.authorId}
                          text="commented on your post"
                          createdAt={comment.createdAt}
                        />
                      </Link>
                    ))}
                  </>
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
