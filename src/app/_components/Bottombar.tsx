"use client";
import { AiOutlineHome } from "react-icons/ai";
import { IoNotificationsOutline, IoSearchSharp } from "react-icons/io5";
import { FiUser } from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import { useAuth } from "@clerk/nextjs";
import { api } from "~/trpc/react";

export const Bottombar = () => {
  const pathname = usePathname();
  const { userId } = useAuth();
  const { data } = api.profile.getUserById.useQuery({ id: userId ?? "" });

  return (
    <section className="fixed bottom-0 z-10 w-full rounded-t-3xl bg-slate-800/70 p-4 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className={`${classNames("relative flex items-center justify-start gap-4 rounded-lg p-4 ", { "bg-slate-700/70": pathname === "/" })}`}
        >
          <AiOutlineHome />
          <p className="max-sm:hidden">Home</p>
        </Link>
        <Link
          href="/search"
          className={`${classNames("relative flex items-center justify-start gap-4 rounded-lg p-4 ", { "bg-slate-700/70": pathname === "/search" })}`}
        >
          <IoSearchSharp />
          <p className="max-sm:hidden">Search</p>
        </Link>
        <Link
          href="/notifications"
          className={`${classNames("relative flex items-center justify-start gap-4 rounded-lg p-4 ", { "bg-slate-700/70": pathname === "/notifications" })}`}
        >
          <IoNotificationsOutline />
          <p className=" max-sm:hidden">Notifications</p>
        </Link>
        <Link
          href={`/@${data?.username}`}
          className={`${classNames("relative flex items-center justify-start gap-4 rounded-lg p-4 ", { "bg-slate-700/70": pathname === `/@${data?.username}` })}`}
        >
          <FiUser />
          <p className="max-sm:hidden">Profile</p>
        </Link>
      </div>
    </section>
  );
};
