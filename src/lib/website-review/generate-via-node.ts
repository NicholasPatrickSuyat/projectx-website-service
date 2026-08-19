import "server-only";
import { execFileSync } from "node:child_process";

export function generateReviewHtmlViaNode(
  templateId: string,
  contentJson: string,
): string | null {
  try {
    const html = execFileSync(
      process.execPath,
      [
        "--import",
        "./scripts/publication-tsx-register.mjs",
        "./scripts/generate-review-html.mjs",
      ],
      {
        cwd: process.cwd(),
        input: JSON.stringify({ templateId, contentJson }),
        encoding: "utf8",
        maxBuffer: 20 * 1024 * 1024,
        windowsHide: true,
      },
    );
    return html.trim() ? html : null;
  } catch (error) {
    console.error("Review HTML generation failed.", error);
    return null;
  }
}
