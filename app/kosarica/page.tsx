import type { Metadata } from "next";
import { CartPageView } from "@/components/commerce/cart-page-view";
import { Breadcrumbs } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Košarica",
  description: "Pregled izdelkov v vaši košarici.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="page-container pb-24 pt-8">
      <Breadcrumbs
        items={[
          { label: "Domov", href: "/" },
          { label: "Košarica", href: "/kosarica" },
        ]}
      />
      <h1 className="mt-6 text-h1">Košarica</h1>
      <CartPageView />
    </div>
  );
}
