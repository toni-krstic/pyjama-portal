import { TRPCError } from "@trpc/server";
import { getLinkPreview, getPreviewFromContent } from "link-preview-js";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { commentLikes, comments, postLikes, posts } from "~/server/db/schema";

type LinkData = {
  url: string;
  title: string;
  siteName: string;
  description: string;
  mediaType: string;
  contentType: string;
  images: string[];
  videos: string[];
  favicons: string[];
  charset: string;
};

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.query.posts.findMany({
      with: {
        postAuthor: true,
        comments: {
          with: {
            commentAuthor: true,
            childComments: {
              with: {
                commentAuthor: true,
                childComments: true,
                commentLikes: true,
                commentShares: true,
              },
              orderBy: (childComments, { desc }) => [
                desc(childComments.createdAt),
              ],
            },
            commentLikes: true,
            commentShares: true,
          },
          orderBy: (comments, { desc }) => [desc(comments.createdAt)],
        },
        likes: true,
        shares: true,
      },
      limit: 100,
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
    return posts;
  }),

  getFollowing: publicProcedure
    .input(z.object({ following: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      const followingPosts = await ctx.db.query.posts.findMany({
        where: inArray(posts.authorId, input.following),
        with: {
          postAuthor: true,
          comments: {
            with: {
              commentAuthor: true,
              childComments: {
                with: {
                  commentAuthor: true,
                  childComments: true,
                  commentLikes: true,
                  commentShares: true,
                },
                orderBy: (childComments, { desc }) => [
                  desc(childComments.createdAt),
                ],
              },
              commentLikes: true,
              commentShares: true,
            },
            orderBy: (comments, { desc }) => [desc(comments.createdAt)],
          },
          likes: true,
          shares: true,
        },
        limit: 100,
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      });
      return followingPosts;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findMany({
        where: eq(posts.id, input.id),
        with: {
          postAuthor: true,
          comments: {
            with: {
              commentAuthor: true,
              childComments: {
                with: {
                  commentAuthor: true,
                  childComments: true,
                  commentLikes: true,
                  commentShares: true,
                },
                orderBy: (childComments, { desc }) => [
                  desc(childComments.createdAt),
                ],
              },
              commentLikes: true,
              commentShares: true,
            },
            orderBy: (comments, { desc }) => [desc(comments.createdAt)],
          },
          likes: true,
          shares: true,
        },
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
        with: {
          postAuthor: true,
          comments: {
            with: {
              commentAuthor: true,
              childComments: {
                with: {
                  commentAuthor: true,
                  childComments: true,
                  commentLikes: true,
                  commentShares: true,
                },
                orderBy: (childComments, { desc }) => [
                  desc(childComments.createdAt),
                ],
              },
              commentLikes: true,
              commentShares: true,
            },
            orderBy: (comments, { desc }) => [desc(comments.createdAt)],
          },
          likes: true,
          shares: true,
        },
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

  getCommentById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [comment] = await ctx.db.query.comments.findMany({
        where: eq(comments.id, input.id),
        with: {
          commentAuthor: true,
          childComments: {
            with: {
              commentAuthor: true,
              childComments: true,
              commentLikes: true,
              commentShares: true,
            },
            orderBy: (childComments, { desc }) => [
              desc(childComments.createdAt),
            ],
          },
          commentLikes: true,
          commentShares: true,
        },
      });
      return comment;
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

  likeComment: privateProcedure
    .input(
      z.object({
        commentId: z.string(),
        authorId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const like = await ctx.db
        .select()
        .from(commentLikes)
        .where(
          and(
            eq(commentLikes.commentId, input.commentId),
            eq(commentLikes.authorId, input.authorId),
          ),
        );

      if (like.length === 0) {
        await ctx.db.insert(commentLikes).values({
          commentId: input.commentId,
          authorId: input.authorId,
        });
        await ctx.db
          .update(comments)
          .set({
            numLikes: sql`${comments.numLikes} + 1`,
          })
          .where(eq(comments.id, input.commentId));
      } else {
        await ctx.db
          .delete(commentLikes)
          .where(
            and(
              eq(commentLikes.commentId, input.commentId),
              eq(commentLikes.authorId, input.authorId),
            ),
          );
        await ctx.db
          .update(comments)
          .set({
            numLikes: sql`${comments.numLikes} - 1`,
          })
          .where(eq(comments.id, input.commentId));
      }
    }),

  getLinkData: publicProcedure
    .input(z.object({ link: z.string() }))
    .query(async ({ input }) => {
      //@ts-ignore
      const data: LinkData = await getLinkPreview(input.link);
      return data;
    }),
});
