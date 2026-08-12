export type FormErrors = Record<string, string>;

export type SubmitResult =
  | { ok: true; reference: string; message: string }
  | { ok: false; errors: FormErrors };

/**
 * Both public forms post to the same endpoint (`app/api/sporocilo/route.ts`),
 * which is where a real mail transport attaches. Keeping the fetch here means
 * neither form component knows the transport exists.
 */
export async function submitMessage(payload: Record<string, unknown>): Promise<SubmitResult> {
  try {
    const response = await fetch("/api/sporocilo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        errors: result.errors ?? { form: result.error ?? "Sporočila ni bilo mogoče oddati." },
      };
    }
    return { ok: true, reference: result.reference, message: result.message };
  } catch {
    return { ok: false, errors: { form: "Povezave ni bilo mogoče vzpostaviti. Poskusite znova." } };
  }
}

/**
 * Moves focus to whichever control the server rejected, without touching any
 * value the visitor has already typed.
 */
export function focusFirstError(form: HTMLFormElement | null, errors: FormErrors) {
  const first = Object.keys(errors).find((key) => key !== "form");
  if (!first || !form) return;
  const node = form.querySelector<HTMLElement>(`[name="${first}"]`);
  node?.focus();
  node?.scrollIntoView({ block: "center", behavior: "smooth" });
}
