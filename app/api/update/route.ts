import { NextResponse } from "next/server";
import { getRedis, type PageRecord } from "@/lib/redis";
import { isHtmlEmpty, isHtmlTooLarge } from "@/lib/validate";

export async function POST(request: Request) {
  let body: { id?: unknown; editToken?: unknown; html?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "We could not read that request." },
      { status: 400 }
    );
  }

  const { id, editToken, html } = body;

  if (!id || typeof id !== "string" || !editToken || typeof editToken !== "string") {
    return NextResponse.json(
      { ok: false, error: "Missing information. Please reload and try again." },
      { status: 400 }
    );
  }

  if (isHtmlEmpty(html)) {
    return NextResponse.json(
      { ok: false, error: "Please paste some code first." },
      { status: 400 }
    );
  }

  if (isHtmlTooLarge(html as string)) {
    return NextResponse.json(
      { ok: false, error: "That page is too large. The limit is 1 MB." },
      { status: 413 }
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

  const key = `page:${id}`;
  let raw: string | null;
  try {
    raw = await redis.get(key);
  } catch (err) {
    console.error("PageMint: failed to read page.", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong saving your page. Please try again." },
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

  if (record.editToken !== editToken) {
    return NextResponse.json(
      { ok: false, error: "That secret key does not match this page." },
      { status: 403 }
    );
  }

  const updated: PageRecord = {
    ...record,
    html: html as string,
    updatedAt: Date.now(),
  };

  try {
    await redis.set(key, JSON.stringify(updated));
  } catch (err) {
    console.error("PageMint: failed to save page.", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong saving your page. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
