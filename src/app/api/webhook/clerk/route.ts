/* eslint-disable camelcase */
// Resource: https://clerk.com/docs/users/sync-data-to-your-backend
// Above article shows why we need webhooks i.e., to sync data to our backend

// Resource: https://docs.svix.com/receiving/verifying-payloads/why
// It's a good practice to verify webhooks. Above article shows why we should do it
import { Webhook, type WebhookRequiredHeaders } from "svix";
import { headers } from "next/headers";

import type { IncomingHttpHeaders } from "http";

import { NextResponse } from "next/server";

import { api } from "~/trpc/server";
import type { WebhookEvent } from "@clerk/nextjs/server";

// Resource: https://clerk.com/docs/integration/webhooks#supported-events
// Above document lists the supported events
type EventType = "user.created" | "user.deleted" | "user.updated";

type Event = {
  data: Record<string, string | number | Record<string, string>[]>;
  object: "event";
  type: EventType;
};

export const POST = async (request: Request) => {
  const payload: WebhookEvent = await request.json();
  const header = headers();

  const heads = {
    "svix-id": header.get("svix-id"),
    "svix-timestamp": header.get("svix-timestamp"),
    "svix-signature": header.get("svix-signature"),
  };

  // Activitate Webhook in the Clerk Dashboard.
  // After adding the endpoint, you'll see the secret on the right side.
  const wh = new Webhook(process.env.NEXT_CLERK_WEBHOOK_SECRET ?? "");

  let evnt: Event | null = null;

  try {
    evnt = wh.verify(
      JSON.stringify(payload),
      heads as IncomingHttpHeaders & WebhookRequiredHeaders,
    ) as Event;
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 400 });
  }

  const eventType: EventType = evnt?.type;

  if (eventType === "user.created") {
    const { id, username, first_name, last_name, image_url } = evnt?.data ?? {};

    try {
      await api.profile.create.mutate({
        id: id?.toString() ?? "",
        username:
          username?.toString() ??
          `${first_name?.toString()}-${last_name?.toString()}`,
        firstName: first_name?.toString() ?? "",
        lastName: last_name?.toString() ?? "",
        profileImage: image_url?.toString() ?? "",
      });

      return NextResponse.json({ message: "User created" }, { status: 201 });
    } catch (err) {
      console.log(err);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 },
      );
    }
  }

  if (eventType === "user.updated") {
    const { id, image_url } = evnt?.data ?? {};

    try {
      await api.profile.updateProfileImage.mutate({
        id: id?.toString() ?? "",
        profileImage: image_url?.toString() ?? "",
      });

      return NextResponse.json({ message: "User updated" }, { status: 201 });
    } catch (err) {
      console.log(err);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 },
      );
    }
  }

  if (eventType === "user.deleted") {
    try {
      const { id } = evnt?.data;

      await api.profile.delete.mutate({ id: id?.toString() ?? "" });

      return NextResponse.json({ message: "User deleted" }, { status: 201 });
    } catch (err) {
      console.log(err);

      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 },
      );
    }
  }
};
