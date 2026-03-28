import type { FastifyInstance } from "fastify";

import { PlayerController } from "../controllers/player.controller.js";
import type { RequestAuthService } from "../services/auth/requestAuth.service.js";
import type { PlayerService } from "../services/player/player.service.js";

interface RegisterPlayerRoutesOptions {
  playerService: PlayerService;
  requestAuthService: RequestAuthService;
}

export async function registerPlayerRoutes(
  server: FastifyInstance,
  options: RegisterPlayerRoutesOptions,
) {
  const controller = new PlayerController(options);

  server.get("/api/v1/profile", controller.getProfile.bind(controller));
  server.patch("/api/v1/profile", controller.updateProfile.bind(controller));
  server.get("/api/v1/goals", controller.getGoals.bind(controller));
  server.patch("/api/v1/goals", controller.updateGoals.bind(controller));
  server.get("/api/v1/xp", controller.getXp.bind(controller));
  server.get("/api/v1/streaks", controller.getStreaks.bind(controller));
  server.get("/api/v1/quests/daily", controller.getDailyQuests.bind(controller));
  server.get("/api/v1/quests/weekly", controller.getWeeklyQuests.bind(controller));
  server.get("/api/v1/progress/today", controller.getTodayProgress.bind(controller));
  server.get("/api/v1/progress/week", controller.getWeekProgress.bind(controller));
  server.get("/api/v1/progress/range", controller.getProgressRange.bind(controller));
}
