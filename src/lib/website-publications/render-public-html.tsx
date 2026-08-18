import "server-only";
import { renderToStaticMarkup } from "react-dom/server";
import { renderTemplate } from "@/lib/templates/render";
import type { TemplateId, WebsiteContent } from "@/lib/templates/types";
import { parseWebsiteContentJson } from "@/lib/websites/content";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Figtree:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

const INTERACTIVITY_SCRIPT = `(function(){
  document.addEventListener("click", function(event) {
    var target = event.target;
    if (!(target instanceof Element)) return;
    var button = target.closest("button[aria-controls][aria-expanded]");
    if (!(button instanceof HTMLButtonElement)) return;
    var panel = document.getElementById(button.getAttribute("aria-controls") || "");
    if (!panel) return;
    var open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", open ? "false" : "true");
    if (button.getAttribute("aria-label") === "Close menu" || button.getAttribute("aria-label") === "Open menu") {
      button.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    }
    if (open) panel.setAttribute("hidden", "");
    else panel.removeAttribute("hidden");
    var mark = button.querySelector("[aria-hidden]");
    if (mark) mark.textContent = open ? "+" : "\\u2212";
  });
})();`;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function rewriteNextImageUrls(html: string): string {
  return html.replace(/\/_next\/image\?[^"'\s]*/g, (url) => {
    const match = /[?&]url=([^&"]+)/.exec(url);
    if (!match?.[1]) {
      return url;
    }
    const original = decodeURIComponent(match[1]);
    if (
      !original.startsWith("/templates/") &&
      !original.startsWith("/media/")
    ) {
      return url;
    }
    return original;
  });
}

export function generatePublicationPublicHtml(
  templateId: string,
  contentJson: string,
): string | null {
  const parsed = parseWebsiteContentJson(
    contentJson,
    templateId as TemplateId,
  );
  if (!parsed.ok) {
    return null;
  }
  return renderPublicationPublicHtml(templateId as TemplateId, parsed.content);
}

export function renderPublicationPublicHtml(
  templateId: TemplateId,
  content: WebsiteContent,
): string | null {
  const rendered = renderTemplate(templateId, content);
  if (!rendered) {
    return null;
  }

  const body = rewriteNextImageUrls(renderToStaticMarkup(rendered));
  const title = escapeHtml(
    content.seo?.title || content.business.businessName || "Website",
  );
  const description = escapeHtml(content.seo?.description || "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<meta name="description" content="${description}"/>
<meta name="robots" content="index, follow"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="${FONT_HREF}"/>
<link rel="stylesheet" href="/publication-runtime.css"/>
</head>
<body>
${body}
<script>${INTERACTIVITY_SCRIPT}</script>
</body>
</html>
`;
}
