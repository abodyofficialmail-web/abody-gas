import { NextRequest, NextResponse } from "next/server";

/** Instagram Reel のサムネイルURLを取得。1) 直接取得 2) Microlink API */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url || !url.includes("instagram.com")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // 1) Microlink API で取得（CORS対応・安定）
  try {
    const microlink = await fetch(
      `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=false&meta=true`,
      { next: { revalidate: 86400 } }
    );
    const data = await microlink.json();
    const thumb = data?.data?.image?.url;
    if (thumb) {
      return NextResponse.json({ thumbnail: thumb });
    }
  } catch {
    /* fallthrough */
  }

  // 2) 直接 fetch して og:image を取得
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 86400 },
    });
    const html = await res.text();
    const match =
      html.match(/property="og:image" content="([^"]+)"/) ||
      html.match(/content="([^"]+)"[^>]+property="og:image"/);
    const thumb = match?.[1]?.replace(/&amp;/g, "&");
    if (thumb) {
      return NextResponse.json({ thumbnail: thumb });
    }
  } catch {
    /* fallthrough */
  }

  return NextResponse.json({ error: "No thumbnail found" }, { status: 404 });
}
