import { NextResponse } from "next/server";
import { getRedis, type PageRecord } from "@/lib/redis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "No page id provided." },
      { status: 400 }
    );
  }

  let redis;
  try {
    redis = getRedis();
  } catch {
    return NextResponse.json(
      { ok: false, error: "PageMint is temporarily unavailable." },
      { status: 503 }
    );
  }

  let raw: string | null;
  try {
    raw = await redis.get(`page:${id}`);
  } catch (err) {
    console.error("PageMint: failed to read page.", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong loading your page. Please try again." },
      { status: 500 }
    );
  }

  if (!raw) {
    return NextResponse.json(
      { ok: false, error: "We could not find that page." },
      { status: 404 }
    );
  }

  let record: PageRecord;
  try {
    record = typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as PageRecord);
  } catch {
    return NextResponse.json(
      { ok: false, error: "We could not find that page." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, html: record.html });
}
