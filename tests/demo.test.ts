import supertest from "supertest";
// import { app } from '../src/app'; // We might need to export app from src/app.ts or src/server.ts

describe("Demo Test Suite", () => {
  it("should pass a basic math test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should have NODE_ENV set to test", () => {
    expect(process.env.NODE_ENV).toBe("test");
  });

  it("should use a test database", async () => {
    const envVariables = (await import("../src/app/config/env")).default;
    console.log(envVariables.MONGO_URI);
    expect(envVariables.MONGO_URI).toContain("test_");
  });
});
