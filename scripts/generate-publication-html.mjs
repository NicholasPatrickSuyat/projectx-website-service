import { generatePublicationPublicHtml } from "../src/lib/website-publications/render-public-html.tsx";

const chunks = [];
for await (const chunk of process.stdin) {
  chunks.push(chunk);
}

const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
const html = generatePublicationPublicHtml(payload.templateId, payload.contentJson);
if (!html) {
  process.exit(2);
}
process.stdout.write(html);
