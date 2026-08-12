import type { Metadata } from "next";
import { CheckoutForm } from "@/components/commerce/checkout-form";
import { Breadcrumbs } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Blagajna",
  description: "Oddaja naročila brez registracije.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="page-container pb-24 pt-8">
      <Breadcrumbs
        items={[
          { label: "Domov", href: "/" },
          { label: "Košarica", href: "/kosarica" },
          { label: "Blagajna", href: "/blagajna" },
        ]}
      />
      <h1 className="mt-6 text-h1">Blagajna</h1>
      <p className="mt-3 max-w-xl text-lead text-muted">
        Naročite lahko brez registracije. Potrebujemo le podatke za dostavo in stik.
      </p>
      <CheckoutForm />
    </div>
  );
}
