import { NextRequest, NextResponse } from "next/server";


const GLOBE_IMAGE_URLS = [
  "https://unpkg.com/three-globe@2.45.0/example/img/earth-dark.jpg",
  "https://cdn.jsdelivr.net/npm/three-globe@2.45.0/example/img/earth-dark.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/e/ea/Equirectangular-projection.jpg",
];

const GLOBE_BUMP_URLS = [
  "https://unpkg.com/three-globe@2.45.0/example/img/earth-topology.png",
  "https://cdn.jsdelivr.net/npm/three-globe@2.45.0/example/img/earth-topology.png",
];

async function proxyImage(urls: string[], defaultType: string) {
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "image/*" },
        next: { revalidate: 86400 },
      });
      if (!res.ok) continue;
      const blob = await res.blob();
      const buffer = Buffer.from(await blob.arrayBuffer());
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": res.headers.get("Content-Type") || defaultType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch {
      continue;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const bump = request.nextUrl.searchParams.get("bump") === "1";
  const urls = bump ? GLOBE_BUMP_URLS : GLOBE_IMAGE_URLS;
  const defaultType = bump ? "image/png" : "image/jpeg";
  const response = await proxyImage(urls, defaultType);
  if (response) return response;
  return new NextResponse("Texture unavailable", { status: 502 });
}
