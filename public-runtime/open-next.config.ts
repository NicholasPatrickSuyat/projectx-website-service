import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Dummy/default cache only. Do not require a remote R2 incremental-cache
// bucket. Do not deploy this Worker.
export default defineCloudflareConfig();
