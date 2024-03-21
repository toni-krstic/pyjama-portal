// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { type InferSelectModel, relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  integer,
  pgTableCreator,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `pyjama-portal_${name}`);

export const users = createTable("user", {
  id: varchar("id", { length: 256 }).primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  firstName: varchar("firstName", { length: 50 }).notNull(),
  lastName: varchar("lastName", { length: 50 }).notNull(),
  profileImage: varchar("profileImage", { length: 256 }),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  followers: many(followers, { relationName: "followers" }),
  following: many(followers, { relationName: "following" }),
  posts: many(posts, { relationName: "posts" }),
  comments: many(comments, { relationName: "comments" }),
  shares: many(shares, { relationName: "shares" }),
  postsLikes: many(postLikes, { relationName: "postsLikes" }),
  commentsLikes: many(commentLikes, { relationName: "commentsLikes" }),
}));

export const followers = createTable("follower", {
  followerId: varchar("followerId", { length: 256 })
    .notNull()
    .references(() => users.id),
  followingId: varchar("followingId", { length: 256 })
    .notNull()
    .references(() => users.id),
});

export const followersRelations = relations(followers, ({ one }) => ({
  follower: one(users, {
    fields: [followers.followerId],
    references: [users.id],
    relationName: "followers",
  }),
  following: one(users, {
    fields: [followers.followingId],
    references: [users.id],
    relationName: "followings",
  }),
}));

export const posts = createTable("post", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: varchar("authorId", { length: 256 }).references(() => users.id),
  content: varchar("content", { length: 256 }),
  numComments: integer("numComments").default(0),
  numLikes: integer("numLikes").default(0),
  numShares: integer("numShares").default(0),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt"),
});

export const postRelations = relations(posts, ({ many, one }) => ({
  comments: many(comments, { relationName: "postComments" }),
  likes: many(postLikes, { relationName: "postLikes" }),
  shares: many(shares, { relationName: "postShares" }),
  postAuthor: one(users, {
    fields: [posts.authorId],
    references: [users.id],
    relationName: "posts",
  }),
}));

export const comments = createTable("comment", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentCommentId: uuid("parentCommentId").references(
    (): AnyPgColumn => comments.id,
  ),
  originalPostId: uuid("originalPostId")
    .notNull()
    .references(() => posts.id),
  authorId: varchar("authorId", { length: 256 })
    .notNull()
    .references(() => users.id),
  content: varchar("content", { length: 256 }).notNull(),
  numLikes: integer("numLikes").default(0),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt"),
});

export const commentsRelations = relations(comments, ({ many, one }) => ({
  childComments: many(comments, { relationName: "parentComment" }),
  commentLikes: many(commentLikes, { relationName: "commentLikes" }),
  commentShares: many(shares, { relationName: "commentShares" }),
  commentAuthor: one(users, {
    fields: [comments.authorId],
    references: [users.id],
    relationName: "comments",
  }),
  originalPost: one(posts, {
    fields: [comments.originalPostId],
    references: [posts.id],
    relationName: "postComments",
  }),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "parentComment",
  }),
}));

export const shares = createTable("share", {
  id: uuid("id").primaryKey().defaultRandom(),
  originalPostId: uuid("originalPostId")
    .notNull()
    .references(() => posts.id),
  commentId: uuid("commentId").references(() => comments.id),
  authorId: varchar("authorId", { length: 256 })
    .notNull()
    .references(() => users.id),
  content: varchar("content", { length: 256 }),
  numLikes: integer("numLikes").default(0),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt"),
});

export const shareRelations = relations(shares, ({ one }) => ({
  originalPost: one(posts, {
    fields: [shares.originalPostId],
    references: [posts.id],
    relationName: "postShares",
  }),
  sharedBy: one(users, {
    fields: [shares.authorId],
    references: [users.id],
    relationName: "shares",
  }),
  comment: one(comments, {
    fields: [shares.commentId],
    references: [comments.id],
    relationName: "commentShares",
  }),
}));

export const postLikes = createTable("post_likes", {
  postId: uuid("postId")
    .notNull()
    .references(() => posts.id),
  authorId: varchar("authorId", { length: 256 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  likedPost: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
    relationName: "postLikes",
  }),
  likedBy: one(users, {
    fields: [postLikes.authorId],
    references: [users.id],
    relationName: "postsLikes",
  }),
}));

export const commentLikes = createTable("comment_likes", {
  commentId: uuid("commentId")
    .notNull()
    .references(() => comments.id),
  authorId: varchar("authorId", { length: 256 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  likedComment: one(comments, {
    fields: [commentLikes.commentId],
    references: [comments.id],
    relationName: "commentLikes",
  }),
  likedBy: one(users, {
    fields: [commentLikes.authorId],
    references: [users.id],
    relationName: "commentsLikes",
  }),
}));

export type Post = InferSelectModel<typeof posts>;
export type Comment = typeof comments.$inferSelect;
