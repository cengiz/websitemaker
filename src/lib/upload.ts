import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export class UploadError extends Error {}

/**
 * Saves an uploaded image under public/uploads/<folder>/ with a random
 * filename and returns the public URL path (e.g. /uploads/<folder>/<id>.png).
 */
export async function saveUploadedImage(file: File, folder: string): Promise<string> {
  if (!(file instanceof File) || file.size === 0) {
    throw new UploadError("Dosya bulunamadı.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError("Dosya boyutu 5MB'ı aşamaz.");
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new UploadError("Sadece JPG, PNG, WEBP veya GIF yükleyebilirsiniz.");
  }

  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
  const dir = path.join(process.cwd(), "public", "uploads", safeFolder);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${safeFolder}/${filename}`;
}
