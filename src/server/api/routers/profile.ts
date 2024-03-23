import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { followers, users } from "~/server/db/schema";

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
      } else {
        await ctx.db
          .delete(followers)
          .where(
            and(
              eq(followers.followerId, followerId),
              eq(followers.followingId, input.followingId),
            ),
          );
      }
    }),
});
