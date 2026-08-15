import {
  REVIEW_TOKEN_BYTES,
  REVIEW_TOKEN_PATTERN,
} from "@/lib/website-review/types";

export function createReviewToken(): string {
  const bytes = new Uint8Array(REVIEW_TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function isReviewToken(value: string): boolean {
  return REVIEW_TOKEN_PATTERN.test(value);
}
