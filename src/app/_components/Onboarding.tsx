"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useToast } from "./ui/use-toast";
import { useState } from "react";

export const Onboarding = (params: { id: string }) => {
  const { id } = params;
  const router = useRouter();
  const utils = api.useUtils();
  const { toast } = useToast();
  const { data } = api.profile.getUserById.useQuery({ id });
  const [user, setUser] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
  });

  const onboardUser = api.profile.update.useMutation({
    onSuccess: () => {
      setUser({
        username: "",
        firstName: "",
        lastName: "",
        bio: "",
      });
      void utils.post.getAll.invalidate();
      router.back();
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

  if (!data) return null;
  return (
    <div className="flex h-full w-full  flex-col items-center justify-center">
      <div className="flex max-w-xl flex-col items-center justify-center overflow-hidden rounded-lg bg-slate-800">
        <div className="relative flex h-32 w-full justify-center bg-slate-700">
          <Image
            src={data.profileImage ?? ""}
            alt={`@${data.username}'s profile picture`}
            height={128}
            width={128}
            className="absolute top-0 mt-[64px] rounded-full border-4 border-black"
          />
        </div>
        <div className="h-[48px]" />
        <form
          className="mt-4 flex flex-col items-center gap-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            onboardUser.mutate({
              id: data.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              bio: user.bio,
              onboarding: false,
              profileImage: data.profileImage ?? "",
            });
          }}
        >
          <div className="flex w-full items-center justify-between">
            <label>Username:</label>
            <input
              type="text"
              placeholder=""
              className="bg-slate-900 outline-none"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
          </div>
          <div className="flex w-full items-center justify-between gap-3">
            <label>First Name:</label>
            <input
              type="text"
              placeholder=""
              className="bg-slate-900 outline-none"
              value={user.firstName}
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
            />
          </div>
          <div className="flex w-full items-center justify-between">
            <label>Last Name: </label>
            <input
              type="text"
              placeholder=""
              className="bg-slate-900 outline-none"
              value={user.lastName}
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
            />
          </div>
          <div className="flex w-full flex-col gap-3">
            <label>Bio: </label>
            <textarea
              placeholder=""
              className="flex h-24 bg-slate-900 text-start outline-none"
              value={user.bio}
              onChange={(e) => setUser({ ...user, bio: e.target.value })}
            />
          </div>

          <button type="submit" className="hover:text-slate-300">
            Create User
          </button>
        </form>
      </div>
    </div>
  );
};
