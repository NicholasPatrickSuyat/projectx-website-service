import "server-only";
import { generatePublicationPublicHtml } from "@/lib/website-publications/render-public-html";
import {
  REVIEW_APPROVE_DONE_END,
  REVIEW_APPROVE_DONE_START,
  REVIEW_APPROVE_OPEN_END,
  REVIEW_APPROVE_OPEN_START,
  REVIEW_APPROVED_AT_PLACEHOLDER,
  REVIEW_NOTICE_PLACEHOLDER,
  REVIEW_TOKEN_PLACEHOLDER,
} from "@/lib/website-review/review-html-placeholders";
import { REVIEW_FEEDBACK_MAX_LENGTH } from "@/lib/website-review/types";

const REVIEW_BANNER = `<header style="position:sticky;top:0;z-index:60;border-bottom:1px solid #e2e8f0;background:rgba(248,246,242,.95);padding:12px 24px;font-family:system-ui,sans-serif;">
<p style="margin:0;font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#64748b;">Project X review</p>
<p style="margin:4px 0 0;max-width:48rem;font-size:14px;line-height:1.5;color:#334155;">This is a preview of the current saved website draft for review. It is not the live website.</p>
</header>`;

const REVIEW_CHROME = `<section id="review-actions" style="border-top:1px solid #e2e8f0;background:#f8f6f2;padding:32px 24px;font-family:system-ui,sans-serif;">
<div style="margin:0 auto;max-width:64rem;display:grid;gap:32px;">
<div>
<h2 style="margin:0;font-size:16px;color:#0f172a;">Request a change</h2>
<p style="margin:4px 0 0;font-size:14px;line-height:1.5;color:#475569;">Describe anything you would like updated. This does not publish the website.</p>
${REVIEW_NOTICE_PLACEHOLDER}
<form method="post" action="/review/${REVIEW_TOKEN_PLACEHOLDER}" style="margin-top:16px;">
<input type="hidden" name="intent" value="feedback"/>
<label for="review-feedback" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);">Requested change</label>
<textarea id="review-feedback" name="message" required maxlength="${REVIEW_FEEDBACK_MAX_LENGTH}" rows="5" placeholder="What would you like changed?" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;background:#fff;padding:8px 12px;font-size:14px;color:#0f172a;"></textarea>
<button type="submit" style="margin-top:12px;display:inline-flex;border:0;border-radius:8px;background:#0f172a;color:#fff;padding:10px 16px;font-size:14px;font-weight:500;">Submit</button>
</form>
</div>
<div>
<h2 style="margin:0;font-size:16px;color:#0f172a;">Approve website</h2>
${REVIEW_APPROVE_OPEN_START}
<p style="margin:4px 0 0;font-size:14px;line-height:1.5;color:#475569;">Approving confirms that you are happy with this website draft. It does not publish the website.</p>
<form method="post" action="/review/${REVIEW_TOKEN_PLACEHOLDER}" onsubmit="return confirm('Approving confirms that you are happy with this website draft. It does not publish the website.');" style="margin-top:16px;">
<input type="hidden" name="intent" value="approve"/>
<button type="submit" style="display:inline-flex;border:0;border-radius:8px;background:#0f172a;color:#fff;padding:10px 16px;font-size:14px;font-weight:500;">Approve Website</button>
</form>
${REVIEW_APPROVE_OPEN_END}
${REVIEW_APPROVE_DONE_START}
<div style="margin-top:16px;border:1px solid #a7f3d0;border-radius:8px;background:#ecfdf5;padding:12px 16px;">
<p style="margin:0;font-size:14px;font-weight:600;color:#064e3b;">Approved</p>
<p style="margin:4px 0 0;font-size:14px;color:#065f46;">${REVIEW_APPROVED_AT_PLACEHOLDER}</p>
<p style="margin:8px 0 0;font-size:14px;line-height:1.5;color:#065f46;">This confirms the draft. It does not publish the website.</p>
</div>
${REVIEW_APPROVE_DONE_END}
</div>
</div>
</section>`;

function withReviewTitle(html: string): string | null {
  const match = /<title>([^<]*)<\/title>/.exec(html);
  if (!match) {
    return null;
  }
  const title = match[1];
  const nextTitle = title.endsWith(" · Review") ? title : `${title} · Review`;
  return html.replace(match[0], `<title>${nextTitle}</title>`);
}

export function generateReviewHtml(
  templateId: string,
  contentJson: string,
): string | null {
  const publicationHtml = generatePublicationPublicHtml(templateId, contentJson);
  if (!publicationHtml) {
    return null;
  }

  const titled = withReviewTitle(publicationHtml);
  if (!titled) {
    return null;
  }

  const noindex = titled.replace(
    /<meta name="robots" content="[^"]*"\/>/,
    '<meta name="robots" content="noindex, nofollow"/>',
  );
  if (noindex === titled && !/content="noindex, nofollow"/.test(titled)) {
    return null;
  }

  const withBanner = noindex.replace(/<body>/, `<body>\n${REVIEW_BANNER}`);
  if (withBanner === noindex) {
    return null;
  }

  const withChrome = withBanner.replace(
    /<script>/,
    `${REVIEW_CHROME}\n<script>`,
  );
  if (withChrome === withBanner) {
    return null;
  }

  if (
    !withChrome.includes(REVIEW_TOKEN_PLACEHOLDER) ||
    !withChrome.includes("Project X review")
  ) {
    return null;
  }

  return withChrome;
}
