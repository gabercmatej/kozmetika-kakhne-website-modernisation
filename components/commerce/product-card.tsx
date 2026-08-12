import Link from "next/link";
import { ProductBadge } from "@/components/ui/badge";
import { DiscountMark, Price } from "@/components/ui/price";
import { displayName } from "@/lib/format";
import { hoverImage, primaryImage, purposeLine } from "@/lib/products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductImage } from "./product-image";
import { QuickAddButton } from "./add-to-cart";

/**
 * One card shape everywhere: a fixed 4:5 image well so mixed source
 * photography still lines up, then name, purpose and price. Quick add sits
 * beside the price rather than floating over the photograph.
 */
export function ProductCard({
  product,
  priority = false,
  sizes = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw",
  className,
}: {
  product: Product;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const image = primaryImage(product);
  /* Which frame this is, and why, is decided in `lib/products.ts`: the second
     photograph for most of the range, or the one the product names for itself
     in `lib/art-direction.ts` where the shop's gallery order buries a better
     shot further down. */
  const hover = hoverImage(product);
  const purpose = purposeLine(product);
  const name = displayName(product.name);

  return (
    <article className={cn("group flex h-full flex-col", className)}>
      <div className="relative overflow-hidden">
        <Link href={`/produkt/${product.slug}`} className="block" tabIndex={-1} aria-hidden="true">
          <div className="relative">
            <ProductImage
              image={image}
              sizes={sizes}
              priority={priority}
              className="aspect-[4/5] w-full"
              imageClassName={cn(
                "transition-transform duration-[600ms] ease-[var(--ease-out-soft)]",
                "motion-safe:group-hover:scale-[1.04]",
                !product.inStock && "opacity-55 saturate-[0.4]"
              )}
            />
            {hover && product.inStock ? (
              <ProductImage
                image={hover}
                sizes={sizes}
                className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-[var(--ease-out-soft)] group-hover:opacity-100"
              />
            ) : null}
          </div>
        </Link>

        <div
          className={cn(
            "pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5",
            /* Keeps a long badge clear of the disc on a two-column phone
               grid: it wraps inside the space left over instead of sliding
               underneath it. */
            product.discountPercent != null && "right-[3.75rem]"
          )}
        >
          <ProductBadge badge={product.badge} />
          {!product.inStock ? <span className="sr-only">Ni na zalogi</span> : null}
        </div>

        {/* The reduction sits opposite the badge, in the corner the source
            site uses for it, so a card can carry both without collision. */}
        <DiscountMark percent={product.discountPercent} size="sm" className="absolute right-3 top-3" />

        {!product.inStock ? (
          <div className="absolute inset-x-0 bottom-0 bg-white/92 px-3 py-2 text-center text-small font-medium text-ink-soft backdrop-blur-[1px]">
            Trenutno ni na zalogi
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-3.5">
        <h3 className="font-sans text-base font-medium leading-snug text-ink">
          <Link
            href={`/produkt/${product.slug}`}
            className="transition-colors duration-200 after:absolute after:inset-0 hover:text-violet-700"
          >
            {name}
          </Link>
        </h3>

        {purpose ? (
          <p className="text-small text-muted">{purpose}</p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="flex flex-col gap-0.5">
            <Price value={product.price} listPrice={product.listPrice} size="sm" />
            {product.volume ? (
              <span className="text-micro text-faint">{product.volume}</span>
            ) : null}
          </div>
          <div className="relative z-10">
            <QuickAddButton product={product} />
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * The card link uses an overlay pseudo-element, so the article needs a
 * positioning context. Applied by the grid rather than by every caller.
 */
export function ProductGrid({
  products,
  columns = 4,
  priorityCount = 0,
  className,
}: {
  products: Product[];
  columns?: 2 | 3 | 4;
  priorityCount?: number;
  className?: string;
}) {
  const cols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
  }[columns];

  return (
    <ul className={cn("grid gap-x-5 gap-y-10", cols, className)}>
      {products.map((product, i) => (
        <li key={product.slug} className="relative">
          <ProductCard product={product} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
