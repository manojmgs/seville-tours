"use client";

import { useState } from "react";
import Image from "next/image";
import type {
  TourGalleryImage,
  WordPressRestImage,
} from "@/lib/wordpress-rest/types";

type TourGalleryProps = {
  images: TourGalleryImage[];
  title: string;
  fallbackImage?: WordPressRestImage;
};

type GalleryDisplayImage = {
  id: number;
  url: string;
  thumbnailUrl: string;
  alt: string;
  name?: string;
};

function toDisplayImages(
  images: TourGalleryImage[],
  title: string,
  fallbackImage?: WordPressRestImage,
): GalleryDisplayImage[] {
  if (images.length > 0) {
    return images.map((image) => ({
      ...image,
      alt: image.alt || image.name || title,
    }));
  }

  if (!fallbackImage) {
    return [];
  }

  return [
    {
      id: fallbackImage.id,
      url: fallbackImage.url,
      thumbnailUrl: fallbackImage.url,
      alt: fallbackImage.alt || title,
      name: fallbackImage.alt || title,
    },
  ];
}

export function TourGallery({
  images,
  title,
  fallbackImage,
}: TourGalleryProps) {
  const displayImages = toDisplayImages(images, title, fallbackImage);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (displayImages.length === 0) {
    return null;
  }

  const selectedImage = displayImages[selectedIndex] ?? displayImages[0];

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="card-glow overflow-hidden rounded-[calc(var(--radius-card)+0.25rem)] bg-stone-200 shadow-sm">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
          <Image
            src={selectedImage.url}
            alt={selectedImage.alt || title}
            fill
            sizes="(max-width: 1024px) 100vw, 760px"
            className="object-cover"
            priority
            fetchPriority="high"
          />
        </div>
      </div>

      {displayImages.length > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {displayImages.map((image, index) => {
            const label = image.alt || image.name || title;
            const isSelected = index === selectedIndex;

            return (
              <button
                key={image.id}
                type="button"
                aria-label={`Show image: ${label}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedIndex(index)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border transition sm:h-24 sm:w-24 ${
                  isSelected
                    ? "border-[var(--brand-green-700)] ring-2 ring-[color:rgba(13,122,92,0.25)]"
                    : "border-[color:var(--border-soft)] opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.thumbnailUrl}
                  alt={label}
                  fill
                  sizes="96px"
                  className="object-cover"
                  loading="lazy"
                  fetchPriority="low"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}