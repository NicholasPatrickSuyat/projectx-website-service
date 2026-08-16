import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Dummy/default cache only. Do not require a remote R2 incremental-cache
// bucket in Milestone 15. Future deployment may add R2 cache separately
// after cost review.
export default defineCloudflareConfig();
