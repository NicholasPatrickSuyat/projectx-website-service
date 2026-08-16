const WEBSITE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STORED_FILENAME_PATTERN = /^[0-9a-f-]{36}\.(jpg|png|webp)$/i;

function getWebsiteMediaObjectKey(websiteId, storedFilename) {
  if (!WEBSITE_ID_PATTERN.test(websiteId)) {
    throw new Error("Website ID is invalid.");
  }
  if (!STORED_FILENAME_PATTERN.test(storedFilename)) {
    throw new Error("Stored filename is invalid.");
  }
  return `${websiteId}/${storedFilename}`;
}

function createR2WebsiteMediaStorage(bucket) {
  return {
    async write(websiteId, storedFilename, bytes) {
      await bucket.put(
        getWebsiteMediaObjectKey(websiteId, storedFilename),
        bytes,
      );
    },
    async read(websiteId, storedFilename) {
      const object = await bucket.get(
        getWebsiteMediaObjectKey(websiteId, storedFilename),
      );
      if (!object) {
        return null;
      }
      return new Uint8Array(await object.arrayBuffer());
    },
  };
}

class MemoryR2Object {
  constructor(bytes) {
    this.bytes = bytes;
  }

  async arrayBuffer() {
    return this.bytes.buffer.slice(
      this.bytes.byteOffset,
      this.bytes.byteOffset + this.bytes.byteLength,
    );
  }
}

class MemoryR2Bucket {
  constructor() {
    this.objects = new Map();
  }

  async put(key, value) {
    this.objects.set(key, new Uint8Array(value));
  }

  async get(key) {
    const bytes = this.objects.get(key);
    return bytes ? new MemoryR2Object(bytes) : null;
  }
}

const websiteId = "11111111-1111-4111-8111-111111111111";
const storedFilename = `${websiteId}.jpg`;
const key = getWebsiteMediaObjectKey(websiteId, storedFilename);
if (key !== `${websiteId}/${storedFilename}`) {
  throw new Error(`Unexpected media object key: ${key}`);
}

const storage = createR2WebsiteMediaStorage(new MemoryR2Bucket());
const payload = new Uint8Array([0xff, 0xd8, 0xff, 0x01, 0x02, 0x03]);
await storage.write(websiteId, storedFilename, payload);
const read = await storage.read(websiteId, storedFilename);
if (!read || read.length !== payload.length || read[0] !== 0xff) {
  throw new Error("R2 media adapter failed to round-trip bytes.");
}

const missing = await storage.read(
  "22222222-2222-4222-8222-222222222222",
  "22222222-2222-4222-8222-222222222222.jpg",
);
if (missing !== null) {
  throw new Error("R2 media adapter should return null for missing objects.");
}

let rejected = false;
try {
  getWebsiteMediaObjectKey("../escape", "not-a-uuid.jpg");
} catch {
  rejected = true;
}
if (!rejected) {
  throw new Error("Media object keys must reject invalid identifiers.");
}

console.log("R2 media adapter contract: pass");
