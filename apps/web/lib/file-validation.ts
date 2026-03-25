import {
  DEFAULT_MAX_UPLOAD_SIZE_BYTES,
  SUPPORTED_IMAGE_MIME_TYPES,
} from "@foodsense/shared";

export function validateImageFile(file: File) {
  if (!SUPPORTED_IMAGE_MIME_TYPES.includes(file.type as (typeof SUPPORTED_IMAGE_MIME_TYPES)[number])) {
    return "Please upload a JPG, PNG, or WEBP image.";
  }

  if (file.size > DEFAULT_MAX_UPLOAD_SIZE_BYTES) {
    return "This image is too large. Please choose a file under 10MB.";
  }

  return null;
}

