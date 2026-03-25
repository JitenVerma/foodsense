export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
    public readonly code = "APP_ERROR",
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidUploadError extends AppError {
  constructor(message: string) {
    super(message, 400, "INVALID_UPLOAD");
  }
}

export class AiProviderError extends AppError {
  constructor(message: string) {
    super(message, 502, "AI_PROVIDER_ERROR");
  }
}

export class InvalidAiResponseError extends AppError {
  constructor(message: string) {
    super(message, 502, "INVALID_AI_RESPONSE");
  }
}

export class NutritionLookupError extends AppError {
  constructor(message: string) {
    super(message, 422, "NUTRITION_LOOKUP_ERROR");
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, 500, "CONFIGURATION_ERROR");
  }
}

