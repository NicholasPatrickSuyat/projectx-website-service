import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isWebsiteId } from "@/lib/websites/validation";

const STORED_FILENAME_PATTERN = /^[0-9a-f-]{36}\.(jpg|png|webp)$/i;

export type WebsiteMediaStorage = {
  write(
    websiteId: string,
    storedFilename: string,
    bytes: Uint8Array,
  ): Promise<void>;
  read(
    websiteId: string,
    storedFilename: string,
  ): Promise<Uint8Array | null>;
};

function storageRoot(): string {
  return path.resolve(process.cwd(), "storage", "website-media");
}

function resolveStoredFile(websiteId: string, storedFilename: string): string {
  if (!isWebsiteId(websiteId)) {
    throw new Error("Website ID is invalid.");
  }
  if (!STORED_FILENAME_PATTERN.test(storedFilename)) {
    throw new Error("Stored filename is invalid.");
  }

  const root = storageRoot();
  const resolved = path.resolve(root, websiteId, storedFilename);
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

const localWebsiteMediaStorage: WebsiteMediaStorage = {
  async write(websiteId, storedFilename, bytes) {
    const filePath = resolveStoredFile(websiteId, storedFilename);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, bytes);
  },

  async read(websiteId, storedFilename) {
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

export function getWebsiteMediaStorage(): WebsiteMediaStorage {
  return localWebsiteMediaStorage;
}
