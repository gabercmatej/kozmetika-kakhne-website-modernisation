"use client";

import { useState } from "react";
import { CartFlight } from "@/components/commerce/cart-flight";
import { CartProvider, useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { CartDrawer } from "./cart-drawer";
import { Header } from "./header";
import { SearchDialog } from "./search-dialog";

/**
 * Single client boundary for the shell. Pages stay server-rendered; only the
 * header, search dialog and cart drawer hydrate.
 */
export function Shell({
  catalogue,
  children,
}: {
  catalogue: Product[];
  children: React.ReactNode;
}) {
  return (
    <CartProvider catalogue={catalogue}>
      <ShellInner>{children}</ShellInner>
    </CartProvider>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { announcement } = useCart();

  return (
    <>
      <Header onOpenSearch={() => setSearchOpen(true)} />
      {children}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartFlight />
      <CartDrawer />
      <p aria-live="polite" role="status" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
