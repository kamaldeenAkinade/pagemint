import { getRedis, type PageRecord } from "@/lib/redis";

function brandedPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${title} - PageMint</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif; background: #faf7f2; color: #2b2b2b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; }
  .card { background: #fff; border-radius: 16px; padding: 40px; max-width: 420px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
  h1 { font-size: 1.4rem; margin: 0 0 12px; }
  p { color: #555; line-height: 1.5; }
  a { color: #3f7d6e; font-weight: 600; text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    <p><a href="/">Go to PageMint</a></p>
  </div>
</body>
</html>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let redis;
  try {
    redis = getRedis();
  } catch {
    return new Response(
      brandedPage(
        "PageMint is having trouble right now",
        "Please try again in a moment."
      ),
      { status: 503, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }

  let raw: string | null;
  try {
    raw = await redis.get(`page:${id}`);
  } catch (err) {
    console.error("PageMint: viewer failed to read page.", err);
    return new Response(
      brandedPage(
        "PageMint is having trouble right now",
        "Please try again in a moment."
      ),
      { status: 503, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }

  if (!raw) {
    return new Response(
      brandedPage(
        "This page does not exist or was deleted",
        "The link may be wrong, or the creator removed it."
      ),
      { status: 404, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }

  let record: PageRecord;
  try {
    record = typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as PageRecord);
  } catch {
    return new Response(
      brandedPage(
        "This page does not exist or was deleted",
        "The link may be wrong, or the creator removed it."
      ),
      { status: 404, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }

  return new Response(record.html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex",
    },
  });
}
