"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";
import { useToast } from "./ui/use-toast";

type userWithFollowers = RouterOutputs["profile"]["getUserByUsername"];
export const FollowButton = (props: userWithFollowers) => {
  const utils = api.useUtils();
  const router = useRouter();
  const { toast } = useToast();

  const follow = api.profile.follow.useMutation({
    onSuccess: () => {
      void utils.profile.getUserByUsername.invalidate();
      void utils.profile.getUserById.invalidate();
      router.refresh();
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage) {
        toast({
          title: "Error",
          description: errorMessage[0],
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong, please try again",
        });
      }
    },
  });

  const user = useUser();
  if (!user.user) return null;

  return (
    <button
      className="ml-2 border border-slate-600 px-2 text-sm font-light"
      onClick={() => follow.mutate({ followingId: props.id })}
    >
      {props.followers.some(
        (follower) =>
          follower.followerId === user.user.id &&
          follower.followingId === props.id,
      )
        ? "Unfollow"
        : "Follow"}
    </button>
  );
};
