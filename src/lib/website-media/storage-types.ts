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
  delete(websiteId: string, storedFilename: string): Promise<void>;
};
