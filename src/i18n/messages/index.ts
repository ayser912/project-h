import type { Locale } from "../config";
import ar, { type Messages } from "./ar";
import en from "./en";

export type { Messages };

export const messages: Record<Locale, Messages> = { ar, en };
