"use client";

import { AiOutlineHome } from "react-icons/ai";
import { IoNotificationsOutline, IoSearchSharp } from "react-icons/io5";
import { FiUser } from "react-icons/fi";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import classNames from "classnames";
import { api } from "~/trpc/react";

export const LeftSidebar = () => {
  const pathname = usePathname();
  const { userId } = useAuth();
  const { data } = api.profile.getUserById.useQuery({ id: userId ?? "" });

  return (
    <section className="sticky left-0 top-0 z-20 flex h-screen w-fit flex-col justify-between overflow-auto border-r pb-5 pt-28 max-md:hidden">
      <div className="flex w-full flex-1 flex-col gap-6 px-6">
        <Link
          href="/"
          className={`${classNames("relative flex items-center justify-start gap-4 rounded-lg p-4 ", { "bg-slate-700": pathname === "/" })}`}
        >
          <AiOutlineHome />
          <p className="max-lg:hidden">Home</p>
        </Link>
        <Link
          href="/search"
          className={`${classNames("relative flex items-center justify-start gap-4 rounded-lg p-4 ", { "bg-slate-700": pathname === "/search" })}`}
        >
          <IoSearchSharp />
          <p className="max-lg:hidden">Search</p>
        </Link>
        <Link
          href="/notifications"
          className={`${classNames("relative flex items-center justify-start gap-4 rounded-lg p-4 ", { "bg-slate-700": pathname === "/notifications" })}`}
        >
          <IoNotificationsOutline />
          <p className="max-lg:hidden">Notifications</p>
        </Link>
        <Link
          href={`/@${data?.username}`}
          className={`${classNames("relative flex items-center justify-start gap-4 rounded-lg p-4 ", { "bg-slate-700": pathname === `/@${data?.username}` })}`}
        >
          <FiUser />
          <p className="max-lg:hidden">Profile</p>
        </Link>
      </div>

      <div className="mt-10 px-6">
        {!data && <SignInButton />}
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "h-14 w-14",
            },
          }}
        />
      </div>
    </section>
  );
};
