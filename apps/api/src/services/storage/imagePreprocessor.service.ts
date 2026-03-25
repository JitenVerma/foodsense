import { SUPPORTED_IMAGE_MIME_TYPES } from "@foodsense/shared";

import { InvalidUploadError } from "../../lib/errors.js";
import { bufferToBase64 } from "../../utils/image.js";

export interface ImagePreprocessorService {
  preprocess(input: {
    buffer: Buffer;
    mimeType: string;
    maxUploadSizeBytes: number;
  }): {
    mimeType: string;
    base64Image: string;
  };
}

export function createImagePreprocessorService(): ImagePreprocessorService {
  return {
    preprocess({ buffer, mimeType, maxUploadSizeBytes }) {
      if (
        !SUPPORTED_IMAGE_MIME_TYPES.includes(
          mimeType as (typeof SUPPORTED_IMAGE_MIME_TYPES)[number],
        )
      ) {
        throw new InvalidUploadError(
          "Unsupported image type. Please upload JPG, PNG, or WEBP.",
        );
      }

      if (buffer.byteLength > maxUploadSizeBytes) {
        throw new InvalidUploadError(
          "Image is too large. Please upload a smaller file.",
        );
      }

      if (buffer.byteLength === 0) {
        throw new InvalidUploadError("Uploaded image was empty.");
      }

      return {
        mimeType,
        base64Image: bufferToBase64(buffer),
      };
    },
  };
}
