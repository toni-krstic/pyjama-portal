import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
};
