"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------ */
  // Keyboard navigation (left/right arrows) while lightbox is open
  /* ------------------------------------------------------------------ */
  useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      e.preventDefault();
      if (e.key === "ArrowRight") {
        setCurrentIndex((i) => Math.min(i + 1, images.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Escape") {
        setLightboxOpen(false);
      }
    },
    [lightboxOpen, images.length]
  );

  if (!images.length)
    return (
      <p className="py-16 text-center">
        Travel photographs will appear here. Explore our destinations for inspiration.
      </p>
    );

  const handleImageClick = useCallback(
    (image: GalleryImage) => {
      setCurrentIndex(images.indexOf(image));
      setLightboxOpen(true);
    },
    [images]
  );

  return (
    <>
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => handleImageClick(image)}
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
      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (gridRef.current) gridRef.current.focus();
          }}
          className="z-[100] max-w-5xl border-0 bg-white p-6 sm:max-w-5xl"
        >
          <DialogTitle className="sr-only">Gallery image</DialogTitle>
          <DialogDescription className="sr-only">
            {images[currentIndex]?.alt || "Global Line Safaris travel photography"}
          </DialogDescription>
          {images.length > 0 && lightboxOpen && (
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].alt || "Global Line Safaris travel photography"}
              width={images[currentIndex].width || 1200}
              height={images[currentIndex].height || 800}
              className="mx-auto max-h-[80vh] w-auto object-contain"
            />
          )}
          <DialogClose
            className="absolute right-4 top-4 rounded-sm p-1 text-slate-400 opacity-70 transition-opacity hover:opacity-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none"
            aria-label="Close gallery"
          >
            <X className="size-4" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}