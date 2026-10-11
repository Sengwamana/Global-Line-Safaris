import { headers } from "next/headers";

/**
 * Renders a <script type="application/ld+json"> tag with the CSP nonce applied.
 *
 * Next.js automatically applies the x-nonce header to its own inline scripts,
 * but NOT to scripts rendered via dangerouslySetInnerHTML. This component reads
 * the nonce from the request headers and applies it so the structured data passes
 * the Content-Security-Policy script-src directive.
 */
export async function JsonLd({ data }: { data: object }) {
  const h = await headers();
  const nonce = h.get("x-nonce") ?? undefined;

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
