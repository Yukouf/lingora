import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing the route
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    promoCode: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    promoRedemption: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/email", () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkAuthRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
  },
}));

import { POST } from "../register/route";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 when required fields are missing", async () => {
    const response = await POST(makeRequest({}) as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("should return 400 when name is missing", async () => {
    const response = await POST(
      makeRequest({
        email: "test@example.com",
        password: "password123",
      }) as never
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("should return 400 when email is missing", async () => {
    const response = await POST(
      makeRequest({
        name: "Test User",
        password: "password123",
      }) as never
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("should return 400 when password is missing", async () => {
    const response = await POST(
      makeRequest({
        name: "Test User",
        email: "test@example.com",
      }) as never
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("should return 400 for invalid email format", async () => {
    const response = await POST(
      makeRequest({
        name: "Test User",
        email: "not-an-email",
        password: "password123",
      }) as never
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("should return 400 for email without domain", async () => {
    const response = await POST(
      makeRequest({
        name: "Test User",
        email: "user@",
        password: "password123",
      }) as never
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("should return 400 when password is too short (less than 8 chars)", async () => {
    const response = await POST(
      makeRequest({
        name: "Test User",
        email: "test@example.com",
        password: "short",
      }) as never
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("should return 400 when name is too short (less than 2 chars)", async () => {
    const response = await POST(
      makeRequest({
        name: "A",
        email: "test@example.com",
        password: "password123",
      }) as never
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
