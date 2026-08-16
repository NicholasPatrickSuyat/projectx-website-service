import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isCloudflareWorkersRuntime } from "@/lib/runtime/env";
import {
  STORED_FILENAME_PATTERN,
  getWebsiteMediaObjectKey,
} from "@/lib/website-media/object-key";
import type { WebsiteMediaStorage } from "@/lib/website-media/storage-types";
import { isWebsiteId } from "@/lib/websites/validation";

function assertLocalFilesystemAllowed() {
  if (isCloudflareWorkersRuntime()) {
    throw new Error(
      "Local filesystem media storage cannot run in the Cloudflare Workers runtime.",
    );
  }
}

function storageRoot(): string {
  return path.resolve(process.cwd(), "storage", "website-media");
}

function resolveStoredFile(websiteId: string, storedFilename: string): string {
  if (!isWebsiteId(websiteId) || !STORED_FILENAME_PATTERN.test(storedFilename)) {
    throw new Error("Stored filename is invalid.");
  }

  const root = storageRoot();
  const objectKey = getWebsiteMediaObjectKey(websiteId, storedFilename);
  const resolved = path.resolve(root, objectKey);
  const relative = path.relative(root, resolved);
  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    relative.includes("\0")
  ) {
    throw new Error("Stored filename is invalid.");
  }

  return resolved;
}

export function getLocalWebsiteMediaStorage(): WebsiteMediaStorage {
  assertLocalFilesystemAllowed();

  return {
    async write(websiteId, storedFilename, bytes) {
      assertLocalFilesystemAllowed();
      const filePath = resolveStoredFile(websiteId, storedFilename);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, bytes);
    },

    async read(websiteId, storedFilename) {
      assertLocalFilesystemAllowed();
      const filePath = resolveStoredFile(websiteId, storedFilename);
      try {
        return await readFile(filePath);
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "ENOENT"
        ) {
          return null;
        }
        throw error;
      }
    },
  };
}
