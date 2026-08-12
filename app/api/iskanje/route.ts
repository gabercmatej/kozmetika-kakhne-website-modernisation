import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/search";

/**
 * The search index, served on demand. The catalogue only changes when the
 * data scripts are re-run, so this is generated once at build time and cached
 * hard at the edge.
 */
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(buildSearchIndex(), {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
