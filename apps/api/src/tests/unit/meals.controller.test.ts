import { describe, expect, it, vi } from "vitest";

import { MealsController } from "../../controllers/meals.controller.js";

describe("MealsController.deleteMeal", () => {
  it("returns a success payload after the meal is deleted", async () => {
    const deleteMeal = vi.fn().mockResolvedValue("meal_123");
    const authenticate = vi.fn().mockResolvedValue({
      userId: "user_123",
      email: "user@example.com",
      accessToken: "token_123",
    });

    const controller = new MealsController({
      mealAnalysisOrchestrator: {} as never,
      mealRecalculationService: {} as never,
      mealPersistenceService: {
        deleteMeal,
      } as never,
      requestAuthService: {
        authenticate,
      } as never,
      maxUploadSizeBytes: 10,
    });

    const send = vi.fn();
    const code = vi.fn().mockReturnValue({ send });
    const logger = {
      child: vi.fn().mockReturnThis(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    await controller.deleteMeal(
      {
        params: { id: "meal_123" },
        log: logger,
        id: "req_123",
        method: "DELETE",
        url: "/api/v1/meals/meal_123",
        headers: {},
      } as never,
      {
        code,
      } as never,
    );

    expect(authenticate).toHaveBeenCalledTimes(1);
    expect(deleteMeal).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "token_123",
        userId: "user_123",
        mealId: "meal_123",
      }),
    );
    expect(code).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith({
      id: "meal_123",
      deleted: true,
    });
  });
});
