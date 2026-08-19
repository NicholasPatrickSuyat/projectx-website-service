import { generateReviewHtml } from "../src/lib/website-review/render-review-html.ts";

const chunks = [];
for await (const chunk of process.stdin) {
  chunks.push(chunk);
}

const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
const html = generateReviewHtml(payload.templateId, payload.contentJson);
if (!html) {
  process.exit(2);
}
process.stdout.write(html);
