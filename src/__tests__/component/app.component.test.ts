import request from "supertest";
import { createApp } from "../../app";
import { RegisterUserUseCase } from "../../modules/user/application/use-cases/register-user/register-user.use-case";
import { UserRepository } from "../../modules/user/domain/user.repository";
import { EmailService } from "../../modules/user/domain/email.service";
import { LoginUseCase } from "../../modules/user/application/use-cases/login/login.use-case";

describe("App Component Tests", () => {
  let mockUserRepository: UserRepository;
  let mockEmailService: EmailService;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      deleteAll: jest.fn(),
    };

    mockEmailService = {
      sendConfirmationEmail: jest.fn(),
    };
  });

  describe("GET /", () => {
    test("should return welcome message", async () => {
      const app = createApp({
        registerUserUseCase: new RegisterUserUseCase(
          mockUserRepository,
          mockEmailService,
        ),
        loginUseCase: new LoginUseCase(mockUserRepository),
      });
      const response = await request(app).get("/").expect(200);

      expect(response.body).toEqual({
        message: "Welcome to Digital Kudos Wall Backend API",
        version: "1.0.0",
        endpoints: {
          health: "/health",
          kudos: "/kudos",
        },
      });
    });
  });

  describe("GET /health", () => {
    test("should return health status", async () => {
      const app = createApp({
        registerUserUseCase: new RegisterUserUseCase(
          mockUserRepository,
          mockEmailService,
        ),
        loginUseCase: new LoginUseCase(mockUserRepository),
      });
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toMatchObject({
        status: "healthy",
        service: "digital-kudos-wall-backend",
        version: "1.0.0",
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe("GET /nonexistent", () => {
    test("should return 404 for unknown routes", async () => {
      const app = createApp({
        registerUserUseCase: new RegisterUserUseCase(
          mockUserRepository,
          mockEmailService,
        ),
        loginUseCase: new LoginUseCase(mockUserRepository),
      });
      const response = await request(app).get("/nonexistent").expect(404);

      expect(response.body).toMatchObject({
        error: "Not Found",
        message: "Route /nonexistent not found",
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
