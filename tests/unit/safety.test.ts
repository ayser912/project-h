import { describe, expect, it } from "vitest";
import { normalizeText, screenPost } from "@/lib/safety/screen";

const screen = (content: string, type: Parameters<typeof screenPost>[0]["type"] = "standard", sourceCount = 0) =>
  screenPost({ content, type, sourceCount });

describe("pre-publication screening", () => {
  it("lets everyday posts through", () => {
    const r = screen("Sunday meal prep done: lentil soup and a salad.");
    expect(r.risk).toBe("low");
    expect(r.status).toBe("published");
  });

  it("holds calls to stop medication for human review (English)", () => {
    const r = screen("Stop taking your medication and drink this tea instead");
    expect(r.risk).toBe("critical");
    expect(r.status).toBe("pending_review");
  });

  it("holds calls to stop medication for human review (Arabic, with spelling variants)", () => {
    const r = screen("توقف عن أخذ الدواء واستعمل هذه الخلطة");
    expect(r.risk).toBe("critical");
    expect(r.status).toBe("pending_review");
    expect(screen("بدلاً من الدواء جرّب هذا").status).toBe("pending_review");
  });

  it("flags cure claims and doses as high risk", () => {
    expect(screen("This herb is a guaranteed cure").risk).toBe("high");
    expect(screen("take 500 mg twice a day").risk).toBe("high");
    expect(screen("علاج نهائي ومضمون").risk).toBe("high");
    expect(screen("الجرعة ٥٠٠ ملغ").risk).toBe("high");
  });

  it("asks for sources on unsourced educational posts without blocking them", () => {
    const r = screen("Walking regularly is part of an active lifestyle.", "educational", 0);
    expect(r.risk).toBe("moderate");
    expect(r.status).toBe("published");
    expect(screen("Walking regularly is part of an active lifestyle.", "educational", 1).risk).toBe("low");
  });

  it("detects identifying details about patients", () => {
    expect(screen("call me on 0791234567").patientInfo.map((f) => f.kind)).toContain("phone");
    expect(screen("email patient@example.com").patientInfo.map((f) => f.kind)).toContain("email");
    expect(screen("اسم المريض محمد ورقم الملف 22").patientInfo.map((f) => f.kind)).toContain("record_reference");
    expect(screen("national number 9981234567").patientInfo.map((f) => f.kind)).toContain("id_number");
    expect(screen("A normal post with no details").patientInfo).toHaveLength(0);
  });

  it("normalises Arabic letters, diacritics and digits", () => {
    expect(normalizeText("أَدْوِيَة ٥")).toBe("ادويه 5");
  });
});
