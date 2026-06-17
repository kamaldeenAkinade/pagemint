export const MAX_HTML_BYTES = 1024 * 1024; // 1 MB

export function isHtmlEmpty(html: unknown): boolean {
  return typeof html !== "string" || html.trim().length === 0;
}

export function htmlByteSize(html: string): number {
  return new TextEncoder().encode(html).length;
}

export function isHtmlTooLarge(html: string): boolean {
  return htmlByteSize(html) > MAX_HTML_BYTES;
}
