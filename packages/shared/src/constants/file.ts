export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const SUPPORTED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
] as const;

export const DEFAULT_MAX_UPLOAD_SIZE_MB = 10;
export const DEFAULT_MAX_UPLOAD_SIZE_BYTES =
  DEFAULT_MAX_UPLOAD_SIZE_MB * 1024 * 1024;

