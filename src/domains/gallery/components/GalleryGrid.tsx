"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<GalleryImage | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  if (!images.length)
    return (
      <p className="py-16 text-center">
        Travel photographs will appear here. Explore our destinations for inspiration.
      </p>
    );

  return (
    <>
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setActive(image);
            }}
            aria-label={`View photograph: ${image.alt || "Global Line Safaris journey"}`}
            className="group relative block w-full overflow-hidden"
          >
            <Image
              src={image.url}
              alt={image.alt || "Global Line Safaris travel photography"}
              width={image.width || 800}
              height={image.height || 600}
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
              loading="lazy"
              decoding="async"
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>
      <Dialog
        open={!!active}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        <DialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
          className="z-[100] max-w-5xl border-0 bg-white p-6 sm:max-w-5xl"
        >
          <DialogTitle className="sr-only">Travel photograph</DialogTitle>
          <DialogDescription className="sr-only">
            {active?.alt || "Global Line Safaris travel photography"}
          </DialogDescription>
          {active && (
            <Image
              src={active.url}
              alt={active.alt || "Global Line Safaris travel photography"}
              width={active.width || 1200}
              height={active.height || 800}
              className="mx-auto max-h-[80vh] w-auto object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
