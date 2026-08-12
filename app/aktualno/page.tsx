import type { Metadata } from "next";
import { ArticleCard } from "@/components/commerce/article-card";
import { Breadcrumbs } from "@/components/ui/misc";
import { articles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Aktualno",
  description: "Novice, nasveti in obvestila Kozmetike Kahne.",
  alternates: { canonical: "/aktualno" },
};

export default function JournalPage() {
  const [lead, ...rest] = articles;

  return (
    <div className="page-container pb-24 pt-8">
      <Breadcrumbs
        items={[
          { label: "Domov", href: "/" },
          { label: "Aktualno", href: "/aktualno" },
        ]}
      />

      <header className="mt-6 max-w-2xl">
        <h1 className="text-h1">Aktualno</h1>
        <p className="mt-3 text-lead text-muted">
          Novice, sezonski nasveti in obvestila o poslovanju.
        </p>
      </header>

      {lead ? (
        <div className="mt-12 border-b border-border pb-12">
          <ArticleCard article={lead} size="lg" />
        </div>
      ) : null}

      <ul className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
        {rest.map((article) => (
          <li key={article.slug}>
            <ArticleCard article={article} />
          </li>
        ))}
      </ul>
    </div>
  );
}
