import Image from "next/image";
import type { ProductImage as ProductImageData } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * One framing rule for the whole catalogue.
 *
 * The source photography mixes studio packshots on white with lifestyle
 * shots. Cropping a packshot slices the bottle; letterboxing a lifestyle shot
 * leaves bars. Each image carries a `fit` classified at build time, and this
 * component is the only place that acts on it, so every card, gallery and
 * tile frames a given product identically.
 *
 * Packshots also get an inset so the product never touches the frame edge,
 * and sit on the tonal ground rather than pure white, which keeps a grid of
 * mixed photography reading as one system.
 */
export function ProductImage({
  image,
  alt = "",
  sizes,
  priority,
  className,
  imageClassName,
  inset = "md",
}: {
  image: ProductImageData | null | undefined;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  inset?: "none" | "sm" | "md" | "lg";
}) {
  if (!image) {
    return <div aria-hidden="true" className={cn("bg-surface", className)} />;
  }

  const isPackshot = image.fit !== "cover";
  const padding = isPackshot
    ? { none: "", sm: "p-3", md: "p-5 sm:p-6", lg: "p-8 sm:p-10" }[inset]
    : "";

  return (
    <div className={cn("relative overflow-hidden", isPackshot ? "bg-white" : "bg-surface", className)}>
      <Image
        src={image.src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(isPackshot ? "object-contain" : "object-cover", padding, imageClassName)}
      />
    </div>
  );
}
