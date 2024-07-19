import crypto from "node:crypto";
import { logger } from "src/logger";
import { JsonValue } from "src/types/common";

export const marker = "ᵻ" as const;

export const hash = (value: string, size = 32) =>
  crypto.createHash("sha256").update(value).digest("hex").slice(0, size);

function getPrerequisites(masterKey: string) {
  const key = hash(masterKey);

  return {
    key,
    salt: hash(key),
  };
}

export function encrypt(data: string, masterKey: string) {
  if (data.endsWith(marker)) {
    logger.warn(`${data} already has encryption marker`, { label: "crypt" });
  }

  const { key, salt } = getPrerequisites(masterKey);

  const iv = hash(salt, 16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  return Buffer.from(cipher.update(data, "utf8", "hex") + cipher.final("hex")).toString("utf8") + marker;
}

export function decrypt(data: string, masterKey: string) {
  if (data.endsWith(marker) === false) {
    return data;
  }

  const { key, salt } = getPrerequisites(masterKey);

  try {
    const iv = hash(salt, 16);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    return decipher.update(data.slice(0, -marker.length), "hex", "utf8") + decipher.final("utf8");
  } catch (e) {
    if ((e as any).code === "ERR_OSSL_BAD_DECRYPT") {
      logger.error("ERR_OSSL_BAD_DECRYPT", { label: "crypt" });
      return null;
    } else {
      throw e;
    }
  }
}

export function apiKey(size = 32, format: BufferEncoding = "base64") {
  const buffer = crypto.randomBytes(size);
  return buffer.toString(format);
}

export function apiHash(apiKey: string) {
  const salt = crypto.randomBytes(8).toString("hex");
  const buffer = crypto.scryptSync(apiKey, salt, 64);
  return `${buffer.toString("hex")}.${salt}`;
}

export function compareApiKeys(storedKey: string, suppliedKey: string) {
  const [hashedPassword, salt] = storedKey.split(".");

  const buffer = crypto.scryptSync(suppliedKey, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(hashedPassword, "hex"), buffer);
}

export function comparePasswords(storedPass: string, suppliedPass: string) {
  return crypto.timingSafeEqual(Buffer.from(storedPass), Buffer.from(suppliedPass));
}

export const decryptJson = (data: string, masterKey: string) =>
  JSON.parse(decrypt(data, masterKey) as string) as JsonValue;
