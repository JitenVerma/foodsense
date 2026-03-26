import { describe, expect, it } from "vitest";

import { buildServer } from "../../app/buildServer.js";

describe("CORS preflight", () => {
  it("allows authenticated DELETE requests from the web app origin", async () => {
    const server = await buildServer({
      envOverrides: {
        NODE_ENV: "test",
      },
    });

    const response = await server.inject({
      method: "OPTIONS",
      url: "/api/v1/meals/test-meal-id",
      headers: {
        origin: "http://localhost:3000",
        "access-control-request-method": "DELETE",
        "access-control-request-headers": "authorization",
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000",
    );
    expect(response.headers["access-control-allow-methods"]).toContain("DELETE");
    expect(response.headers["access-control-allow-headers"]).toContain(
      "Authorization",
    );

    await server.close();
  });
});
