import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

interface RateLimitData {
  count: number;
  lastReset: number;
}
type RateLimitMap = Map<string | undefined, RateLimitData>;

const rateLimitMap: RateLimitMap = new Map();

export default authMiddleware({
  beforeAuth: (req) => {
    const ip = req.headers.get("x-forwarded-for") ?? req.ip;
    const limit = 10; // Limiting requests to 5 per minute per IP
    const windowMs = 60 * 1000; // 1 minute

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, {
        count: 0,
        lastReset: Date.now(),
      });
    }

    const ipData: RateLimitData | undefined = rateLimitMap.get(ip);

    if (ipData && Date.now() - ipData.lastReset > windowMs) {
      ipData.count = 0;
      ipData.lastReset = Date.now();
    }

    if (ipData && ipData.count >= limit) {
      return NextResponse.redirect(new URL("/api/blocked", req.url));
    }

    if (ipData) {
      ipData.count += 1;
    }
  },

  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/api/trpc/post.getAll",
    "/api/trpc/profile.create",
    "/api/trpc/profile.updateProfileImage",
    "/api/trpc/profile.delete",
    "/api/trpc/profile.getUserById,post.getAll",
    "/api/webhook/clerk",
  ],

  ignoredRoutes: ["/api/blocked"],
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
