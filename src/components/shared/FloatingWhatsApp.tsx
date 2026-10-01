"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";

// Context-aware pre-filled messages keyed by public tourism routes.
const CONTEXT_MESSAGES: Array<{ matcher: string; message: string }> = [
  {
    matcher: "/destinations",
    message:
      "Hello Global Line Safaris, I would like help choosing a destination in Rwanda or East Africa.",
  },
  {
    matcher: "/tour-packages",
    message:
      "Hello Global Line Safaris, I would like to learn more about your tour packages.",
  },
  {
    matcher: "/services",
    message:
      "Hello Global Line Safaris, I would like to learn more about your travel services.",
  },
  {
    matcher: "/plan-your-trip",
    message:
      "Hello Global Line Safaris, I would like help planning a personalised trip.",
  },
];

const WHATSAPP_GREEN = "#25D366";

export function FloatingWhatsApp() {
  const pathname = usePathname();

  const contextMessage =
    CONTEXT_MESSAGES.find((c) => pathname?.startsWith(c.matcher))?.message ??
    siteConfig.whatsappMessage;

  const href = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(contextMessage)}`;
  const ariaLabel = "Chat with Global Line Safaris on WhatsApp";

  return (
    <div className="fixed right-[18px] bottom-[18px] z-40 sm:right-6 sm:bottom-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        title="Chat with Global Line Safaris"
        className="group flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lift transition-all duration-300 hover:scale-[1.08] hover:shadow-glow-accent-strong focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto sm:min-w-0 sm:px-0 sm:hover:px-5 whatsapp-green"
      >
        <span
          aria-hidden="true"
          className="flex aspect-square w-10 h-10 shrink-0 items-center justify-center"
        >
          <WhatsAppIcon size={30} className="h-auto w-auto max-w-full max-h-full object-contain" />
        </span>
        <span className="hidden min-w-0 max-w-0 overflow-hidden whitespace-nowrap text-[15px] font-semibold text-white opacity-0 transition-all duration-300 group-hover:ml-2.5 group-hover:max-w-[160px] group-hover:opacity-100 sm:inline-block">
          Chat with us
        </span>
      </a>
    </div>
  );
}
