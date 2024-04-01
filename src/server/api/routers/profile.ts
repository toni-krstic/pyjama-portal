import { TRPCError } from "@trpc/server";
import { and, eq, ilike, or } from "drizzle-orm";
import { withCursorPagination } from "drizzle-pagination";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { followers, notifications, users } from "~/server/db/schema";

export const profileRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        id: z.string(),
        username: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        profileImage: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(users).values({
        id: input.id,
        username: input.username,
        firstName: input.firstName,
        lastName: input.lastName,
        profileImage: input.profileImage,
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        username: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        bio: z.string(),
        onboarding: z.boolean(),
        profileImage: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({
          username: input.username,
          firstName: input.firstName,
          lastName: input.lastName,
          bio: input.bio,
          onboarding: input.onboarding,
          profileImage: input.profileImage,
        })
        .where(eq(users.id, input.id));
    }),

  updateProfileImage: publicProcedure
    .input(
      z.object({
        id: z.string(),
        profileImage: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({
          profileImage: input.profileImage,
        })
        .where(eq(users.id, input.id));
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(users).where(eq(users.id, input.id));
    }),

  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const [user] = await ctx.db.query.users.findMany({
        with: { followers: true, following: true },
        where: eq(users.username, input.username),
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }

      return user;
    }),

  getUserById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [user] = await ctx.db.query.users.findMany({
        with: { followers: true, following: true },
        where: eq(users.id, input.id),
      });

      return user;
    }),

  search: publicProcedure
    .input(
      z.object({
        searchTerm: z.string(),
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(50).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.query.users.findMany({
        ...withCursorPagination({
          where: or(
            ilike(users.username, input.searchTerm),
            ilike(users.firstName, input.searchTerm),
            ilike(users.lastName, input.searchTerm),
          ),
          limit: input.limit,
          cursors: [
            [
              users.createdAt,
              "desc",
              input.cursor ? new Date(input.cursor) : undefined,
            ],
          ],
        }),
      });

      return {
        data,
        nextCursor: data.length
          ? data[data.length - 1]?.createdAt.toISOString()
          : null,
      };
    }),

  getNotifications: publicProcedure
    .input(
      z.object({
        id: z.string(),
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(50).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.query.notifications.findMany({
        ...withCursorPagination({
          where: eq(notifications.userId, input.id),
          limit: input.limit,
          cursors: [
            [
              notifications.createdAt,
              "desc",
              input.cursor ? new Date(input.cursor) : undefined,
            ],
          ],
        }),
      });

      return {
        data,
        nextCursor: data.length
          ? data[data.length - 1]?.createdAt.toISOString()
          : null,
      };
    }),

  follow: privateProcedure
    .input(z.object({ followingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const followerId = ctx.currentUser.userId ?? "";
      const [follow] = await ctx.db
        .select()
        .from(followers)
        .where(
          and(
            eq(followers.followerId, followerId),
            eq(followers.followingId, input.followingId),
          ),
        );
      if (!follow) {
        await ctx.db.insert(followers).values({
          followerId: followerId,
          followingId: input.followingId,
        });
        await ctx.db.insert(notifications).values({
          userId: input.followingId,
          authorId: followerId,
          content: "followed you",
        });
      } else {
        await ctx.db
          .delete(followers)
          .where(
            and(
              eq(followers.followerId, followerId),
              eq(followers.followingId, input.followingId),
            ),
          );
        await ctx.db
          .delete(notifications)
          .where(
            and(
              eq(notifications.userId, input.followingId),
              eq(notifications.authorId, followerId),
              eq(notifications.content, "followed you"),
            ),
          );
      }
    }),
});
