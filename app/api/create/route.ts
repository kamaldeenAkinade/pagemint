import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getRedis, type PageRecord } from "@/lib/redis";
import { isHtmlEmpty, isHtmlTooLarge } from "@/lib/validate";

export async function POST(request: Request) {
  let body: { html?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "We could not read that request." },
      { status: 400 }
    );
  }

  const html = body.html;

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

  const id = nanoid(8);
  const editToken = nanoid(24);
  const now = Date.now();

  const record: PageRecord = {
    html: html as string,
    editToken,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await redis.set(`page:${id}`, JSON.stringify(record));
  } catch (err) {
    console.error("PageMint: failed to save page.", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Something went wrong saving your page. Please try again.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id, editToken });
}
