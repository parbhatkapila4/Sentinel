export function getYoutubeEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  const fromWatch = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]{11})/
  );
  if (fromWatch?.[1]) {
    return `https://www.youtube.com/embed/${fromWatch[1]}`;
  }
  const fromShort = trimmed.match(/youtu\.be\/([\w-]{11})/);
  if (fromShort?.[1]) {
    return `https://www.youtube.com/embed/${fromShort[1]}`;
  }
  return null;
}

export function shouldUseVideoElement(url: string): boolean {
  const u = url.trim();
  if (u.startsWith("/")) return true;
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(u);
}
