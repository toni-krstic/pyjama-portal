import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { comments, postLikes, posts } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.query.posts.findMany({
      with: { postAuthor: true },
      limit: 100,
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
    return posts;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findMany({
        where: eq(posts.id, input.id),
        with: { postAuthor: true },
        limit: 100,
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      });
      if (post.length === 0)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      return post[0];
    }),

  getByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.posts.findMany({
        where: eq(posts.authorId, input.userId),
        with: { postAuthor: true },
        limit: 100,
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      });
    }),

  create: privateProcedure
    .input(z.object({ content: z.string().min(1).max(256) }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser.userId;
      await ctx.db.insert(posts).values({
        content: input.content,
        authorId,
      });
    }),

  comment: privateProcedure
    .input(
      z.object({
        authorId: z.string(),
        parentCommentId: z.string(),
        originalPostId: z.string(),
        content: z.string().min(1).max(256),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(comments).values({
        parentCommentId:
          input.parentCommentId === "" ? null : input.parentCommentId,
        originalPostId: input.originalPostId,
        content: input.content,
        authorId: input.authorId,
      });

      await ctx.db
        .update(posts)
        .set({
          numComments: sql`${posts.numComments} + 1`,
        })
        .where(eq(posts.id, input.originalPostId));
    }),

  like: privateProcedure
    .input(
      z.object({
        postId: z.string(),
        authorId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const like = await ctx.db
        .select()
        .from(postLikes)
        .where(
          and(
            eq(postLikes.postId, input.postId),
            eq(postLikes.authorId, input.authorId),
          ),
        );

      if (like.length === 0) {
        await ctx.db.insert(postLikes).values({
          postId: input.postId,
          authorId: input.authorId,
        });
        await ctx.db
          .update(posts)
          .set({
            numLikes: sql`${posts.numLikes} + 1`,
          })
          .where(eq(posts.id, input.postId));
      } else {
        await ctx.db
          .delete(postLikes)
          .where(
            and(
              eq(postLikes.postId, input.postId),
              eq(postLikes.authorId, input.authorId),
            ),
          );
        await ctx.db
          .update(posts)
          .set({
            numLikes: sql`${posts.numLikes} - 1`,
          })
          .where(eq(posts.id, input.postId));
      }
    }),
});
