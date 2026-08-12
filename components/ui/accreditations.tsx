import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The four accreditation seals, drawn rather than shipped as artwork.
 *
 * The shop supplied these as a flat violet PNG. Redrawing them costs a little
 * geometry and buys three things a bitmap could not: they stay sharp at any
 * size, they take the brand violet from the theme instead of introducing a
 * second one, and each seal exposes its own accessible name — a single image
 * of four badges is one alt string that has to describe all of them at once.
 *
 * Everything is laid out in a 100×100 user space and scaled by CSS, so the
 * only number that ever changes is the rendered box.
 */

/**
 * The scalloped rim: 2n points alternating between two radii. Sampling from
 * -90° starts the first tooth at twelve o'clock, which keeps the shape
 * symmetrical about the vertical axis whatever the tooth count.
 */
function scallop(teeth: number, outer: number, inner: number, cx = 50, cy = 50): string {
  const step = Math.PI / teeth;
  const points: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = i * step - Math.PI / 2;
    points.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return `M${points.join("L")}Z`;
}

const RIM = scallop(30, 50, 45.5);

/**
 * The arc the ring text runs along: a semicircle drawn left to right over the
 * top, so text anchored at its midpoint sits centred above the monogram and
 * reads the right way up.
 */
const TEXT_ARC = "M 9.5,50 A 40.5,40.5 0 0 1 90.5,50";

type Seal = (typeof site.accreditations)[number];

function AccreditationSeal({ seal, className }: { seal: Seal; className?: string }) {
  /* One id per seal, or two seals on the same page would share a textPath. */
  const arcId = `seal-arc-${seal.id}`;

  return (
    <figure className={cn("flex flex-col items-center text-center", className)}>
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label={seal.label}
        className="h-24 w-24 text-violet-700 sm:h-28 sm:w-28"
      >
        <defs>
          <path id={arcId} d={TEXT_ARC} fill="none" />
        </defs>

        <path d={RIM} fill="currentColor" />
        <circle cx="50" cy="50" r="36.5" fill="var(--color-paper)" />

        {/* Cased in JS rather than with `text-transform`: SVG text honours the
            property unevenly across engines, and Slovenian needs a locale-aware
            fold to keep š and ž intact. */}
        <text fill="var(--color-paper)" fontSize="6.4" fontWeight="600" letterSpacing="0.55">
          <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
            {seal.arc.toLocaleUpperCase("sl")}
          </textPath>
        </text>

        {seal.monogram === "idea" ? (
          /* Drawn from primitives rather than an icon component: an icon set
             renders its own nested <svg>, and a nested viewBox inside this one
             would have to be positioned by attributes the component does not
             forward. A circle and two strokes read the same at 24px. */
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="50" cy="42" r="9.5" />
            <path d="M45 53.5v3.4h10v-3.4" />
            <path d="M46.8 60.2h6.4" />
          </g>
        ) : (
          <text
            x="50"
            y={seal.lines.length > 1 ? 54 : 56}
            fill="currentColor"
            fontSize={seal.monogram.length > 2 ? 17 : 21}
            fontWeight="700"
            letterSpacing={seal.monogram.length > 1 ? "0.5" : "0"}
            textAnchor="middle"
          >
            {seal.monogram}
          </text>
        )}

        {seal.lines.map((line, i) => (
          <text
            key={line}
            x="50"
            /* Stacked upward from the disc's lower edge so one- and two-line
               seals share a baseline instead of drifting apart. */
            y={72 - (seal.lines.length - 1 - i) * 5.4}
            fill="currentColor"
            fontSize="4.6"
            fontWeight="600"
            letterSpacing="0.18"
            textAnchor="middle"
          >
            {line.toLocaleUpperCase("sl")}
          </text>
        ))}
      </svg>
    </figure>
  );
}

export function Accreditations({ className }: { className?: string }) {
  return (
    <section className={cn("border-t border-border pt-10", className)}>
      <h2 className="font-sans text-body font-medium">Priznanja in diplome</h2>
      <p className="mt-2 max-w-xl text-base text-muted">
        Znanje, po katerem so izdelki sestavljeni, je bilo prevzeto in preverjeno tudi zunaj hiše.
      </p>

      <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
        {site.accreditations.map((seal) => (
          <li key={seal.id} className="flex flex-col items-center">
            <AccreditationSeal seal={seal} />
            <p className="mt-4 max-w-[13rem] text-small leading-snug text-muted">{seal.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
