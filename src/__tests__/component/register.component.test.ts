import request from "supertest";
import { createApp } from "../../app";
import { RegisterUserUseCase } from "../../modules/user/application/use-cases/register-user/register-user.use-case";
import { UserRepository } from "../../modules/user/domain/user.repository";
import { EmailService } from "../../modules/user/domain/email.service";
import { LoginUseCase } from "../../modules/user/application/use-cases/login/login.use-case";

describe("User Component Tests", () => {
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

  describe("POST /users/register", () => {
    it("should return 201 when user is successfully registered", async () => {
      const registerUserUseCase = new RegisterUserUseCase(
        mockUserRepository,
        mockEmailService,
      );
      const app = createApp({
        registerUserUseCase,
        loginUseCase: new LoginUseCase(mockUserRepository),
      });

      const requestBody = {
        name: "Test User",
        email: "test@example.com",
        password: "ValidPassword123!",
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (mockUserRepository.save as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/users/register")
        .send(requestBody)
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: requestBody.name,
        email: requestBody.email,
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalledWith(
        requestBody.email,
      );
    });

    it("should return 409 Conflict when user already exists", async () => {
      const registerUserUseCase = new RegisterUserUseCase(
        mockUserRepository,
        mockEmailService,
      );
      const app = createApp({
        registerUserUseCase,
        loginUseCase: new LoginUseCase(mockUserRepository),
      });

      const requestBody = {
        name: "Existing User",
        email: "existing@example.com",
        password: "ValidPassword123!",
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue({
        id: "any-id",
      });

      const response = await request(app)
        .post("/users/register")
        .send(requestBody)
        .expect(409);

      expect(response.body.message).toContain(
        "User with this email already exists",
      );
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockEmailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });

    it("should return 400 Bad Request for invalid input (e.g., weak password)", async () => {
      const registerUserUseCase = new RegisterUserUseCase(
        mockUserRepository,
        mockEmailService,
      );
      const app = createApp({
        registerUserUseCase,
        loginUseCase: new LoginUseCase(mockUserRepository),
      });

      const requestBody = {
        name: "Test User",
        email: "test@example.com",
        password: "weak",
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/users/register")
        .send(requestBody)
        .expect(400);

      expect(response.body.message).toContain(
        "Password must be at least 8 characters long",
      );
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockEmailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });
  });
});
