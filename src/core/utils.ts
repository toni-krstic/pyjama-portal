import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User } from "@clerk/nextjs/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profilePicture: user.imageUrl,
  };
};
