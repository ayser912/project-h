import type { PostType, RiskLevel, ModerationStatus } from "@/lib/types";

/**
 * Pre-publication screening (spec §7.3, §8.4).
 *
 * This is a deliberately simple, explainable keyword screen. It only decides
 * whether a post should wait for HUMAN review before being distributed; it
 * never judges medical accuracy. In Phase 4 it can be complemented by an
 * AI triage step — still only as a screening aid.
 */

/** Normalise Arabic so spelling variants match (alef forms, ta marbuta, diacritics, tatweel). */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "") // harakat + tatweel
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\s+/g, " ");
}

const CRITICAL_PATTERNS: RegExp[] = [
  /stop (taking )?(your )?(prescribed )?(medication|medicine|insulin|treatment)/,
  /(instead of|replace) (your )?(medication|medicine|insulin|chemo|treatment)/,
  /(توقف|اوقف|وقف) (عن )?(اخذ )?(الدواء|الادويه|العلاج|الانسولين)/,
  /بدل(ا)? (من )?(الدواء|الادويه|العلاج|الانسولين)/,
];

const HIGH_PATTERNS: RegExp[] = [
  /\bcures?\b/,
  /guaranteed/,
  /miracle/,
  /\b\d+\s?(mg|mcg|ml|units?)\b/,
  /\bdos(e|age)\b/,
  /علاج نهائي/,
  /يشفي|شفاء تام|شفاء نهائي/,
  /مضمون/,
  /معجزه/,
  /جرعه/,
  /\d+\s?(ملغ|مغ|ملغم|وحده)/,
];

const MODERATE_PATTERNS: RegExp[] = [
  /prevents?|reduces? (the )?risk|treats?|boosts? (your )?immun/,
  /يمنع|يقلل (من )?(خطر|احتمال)|يعالج|يقوي المناعه/,
];

export interface PatientInfoFinding {
  kind: "phone" | "email" | "id_number" | "record_reference";
}

const PATIENT_PATTERNS: Array<[PatientInfoFinding["kind"], RegExp]> = [
  ["phone", /(\+?962|00962|0)7[789]\d{7}\b/],
  ["phone", /\+\d{1,3}[\s-]?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/],
  ["email", /[\w.+-]+@[\w-]+\.[\w.]+/],
  ["id_number", /\b\d{10}\b/],
  [
    "record_reference",
    /(patient name|mrn|medical record|file (no|number)|اسم المريض|رقم الملف|ملف المريض|رقم المريض)/,
  ],
];

export interface ScreeningResult {
  risk: RiskLevel;
  /** What happens to distribution after publishing. */
  status: ModerationStatus;
  reasons: Array<"treatment_claim" | "dosage" | "stop_medication" | "health_claim" | "no_sources">;
  patientInfo: PatientInfoFinding[];
}

export function screenPost(input: {
  content: string;
  type: PostType;
  sourceCount: number;
}): ScreeningResult {
  const text = normalizeText(input.content);
  const reasons: ScreeningResult["reasons"] = [];
  let risk: RiskLevel = "low";

  if (CRITICAL_PATTERNS.some((p) => p.test(text))) {
    risk = "critical";
    reasons.push("stop_medication");
  }
  const highHits = HIGH_PATTERNS.filter((p) => p.test(text));
  if (highHits.length) {
    if (risk !== "critical") risk = "high";
    const dosage = highHits.some((p) => /mg|ملغ|جرعه|dos/.test(p.source));
    reasons.push(dosage ? "dosage" : "treatment_claim");
  }
  if (risk === "low" && MODERATE_PATTERNS.some((p) => p.test(text))) {
    risk = "moderate";
    reasons.push("health_claim");
  }
  if (risk === "low" && input.type === "educational" && input.sourceCount === 0) {
    risk = "moderate";
    reasons.push("no_sources");
  }

  const patientInfo: PatientInfoFinding[] = [];
  for (const [kind, re] of PATIENT_PATTERNS) {
    if (re.test(text) && !patientInfo.some((f) => f.kind === kind)) {
      patientInfo.push({ kind });
    }
  }

  const status: ModerationStatus =
    risk === "high" || risk === "critical" ? "pending_review" : "published";

  return { risk, status, reasons, patientInfo };
}
