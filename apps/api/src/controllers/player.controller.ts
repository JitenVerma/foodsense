import type { FastifyReply, FastifyRequest } from "fastify";

import { createRequestLogger } from "../lib/logger.js";
import type { RequestAuthService } from "../services/auth/requestAuth.service.js";
import type { PlayerService } from "../services/player/player.service.js";
import {
  PlayerDateQuerySchema,
  PlayerProgressRangeQuerySchema,
  UpdateGoalsBodySchema,
  UpdateProfileBodySchema,
} from "../schemas/player.schemas.js";

interface PlayerControllerOptions {
  playerService: PlayerService;
  requestAuthService: RequestAuthService;
}

export class PlayerController {
  constructor(private readonly options: PlayerControllerOptions) {}

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const logger = createRequestLogger(request).child({
      operation: "player.profile.get",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const profile = await this.options.playerService.getProfile({
      accessToken: auth.accessToken,
      userId: auth.userId,
    });
    return reply.code(200).send(profile);
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const logger = createRequestLogger(request).child({
      operation: "player.profile.update",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const updates = UpdateProfileBodySchema.parse(request.body);
    const profile = await this.options.playerService.updateProfile({
      accessToken: auth.accessToken,
      userId: auth.userId,
      updates,
      logger,
    });
    return reply.code(200).send(profile);
  }

  async getGoals(request: FastifyRequest, reply: FastifyReply) {
    const logger = createRequestLogger(request).child({
      operation: "player.goals.get",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const goals = await this.options.playerService.getGoals({
      accessToken: auth.accessToken,
      userId: auth.userId,
    });
    return reply.code(200).send(goals);
  }

  async updateGoals(request: FastifyRequest, reply: FastifyReply) {
    const logger = createRequestLogger(request).child({
      operation: "player.goals.update",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const updates = UpdateGoalsBodySchema.parse(request.body);
    const goals = await this.options.playerService.updateGoals({
      accessToken: auth.accessToken,
      userId: auth.userId,
      updates,
      logger,
    });
    return reply.code(200).send(goals);
  }

  async getXp(request: FastifyRequest<{ Querystring: { date?: string; timeZone?: string } }>, reply: FastifyReply) {
    const logger = createRequestLogger(request).child({
      operation: "player.xp.get",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const query = PlayerDateQuerySchema.parse(request.query);
    const xp = await this.options.playerService.getXpSummary({
      accessToken: auth.accessToken,
      userId: auth.userId,
      date: query.date,
      timeZone: query.timeZone,
    });
    return reply.code(200).send(xp);
  }

  async getStreaks(request: FastifyRequest<{ Querystring: { date?: string; timeZone?: string } }>, reply: FastifyReply) {
    const logger = createRequestLogger(request).child({
      operation: "player.streaks.get",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const query = PlayerDateQuerySchema.parse(request.query);
    const streaks = await this.options.playerService.getStreakSummary({
      accessToken: auth.accessToken,
      userId: auth.userId,
      date: query.date,
      timeZone: query.timeZone,
    });
    return reply.code(200).send(streaks);
  }

  async getDailyQuests(request: FastifyRequest<{ Querystring: { date?: string; timeZone?: string } }>, reply: FastifyReply) {
    const logger = createRequestLogger(request).child({
      operation: "player.quests.daily",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const query = PlayerDateQuerySchema.parse(request.query);
    const quests = await this.options.playerService.getQuests({
      accessToken: auth.accessToken,
      userId: auth.userId,
      questType: "daily",
      date: query.date,
      timeZone: query.timeZone,
    });
    return reply.code(200).send(quests);
  }

  async getWeeklyQuests(request: FastifyRequest<{ Querystring: { date?: string; timeZone?: string } }>, reply: FastifyReply) {
    const logger = createRequestLogger(request).child({
      operation: "player.quests.weekly",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const query = PlayerDateQuerySchema.parse(request.query);
    const quests = await this.options.playerService.getQuests({
      accessToken: auth.accessToken,
      userId: auth.userId,
      questType: "weekly",
      date: query.date,
      timeZone: query.timeZone,
    });
    return reply.code(200).send(quests);
  }

  async getTodayProgress(request: FastifyRequest<{ Querystring: { date?: string; timeZone?: string } }>, reply: FastifyReply) {
    const logger = createRequestLogger(request).child({
      operation: "player.progress.today",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const query = PlayerDateQuerySchema.parse(request.query);
    const progress = await this.options.playerService.getTodayProgress({
      accessToken: auth.accessToken,
      userId: auth.userId,
      date: query.date,
      timeZone: query.timeZone,
    });
    return reply.code(200).send(progress);
  }

  async getWeekProgress(request: FastifyRequest<{ Querystring: { date?: string; timeZone?: string } }>, reply: FastifyReply) {
    const logger = createRequestLogger(request).child({
      operation: "player.progress.week",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const query = PlayerDateQuerySchema.parse(request.query);
    const progress = await this.options.playerService.getWeekProgress({
      accessToken: auth.accessToken,
      userId: auth.userId,
      date: query.date,
      timeZone: query.timeZone,
    });
    return reply.code(200).send(progress);
  }

  async getProgressRange(
    request: FastifyRequest<{
      Querystring: { period: "weekly" | "monthly"; date?: string; timeZone?: string };
    }>,
    reply: FastifyReply,
  ) {
    const logger = createRequestLogger(request).child({
      operation: "player.progress.range",
    });
    const auth = await this.options.requestAuthService.authenticate(request, logger);
    const query = PlayerProgressRangeQuerySchema.parse(request.query);
    const progress = await this.options.playerService.getProgressRange({
      accessToken: auth.accessToken,
      userId: auth.userId,
      period: query.period,
      date: query.date,
      timeZone: query.timeZone,
    });
    return reply.code(200).send(progress);
  }
}
