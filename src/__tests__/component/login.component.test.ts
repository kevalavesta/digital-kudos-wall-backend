import request from "supertest";
import { Application } from "express";
import { UserRepository } from "../../modules/user/domain/user.repository";
import { LoginUseCase } from "../../modules/user/application/use-cases/login/login.use-case";
import { createApp } from "../../app";
import { UserBuilder } from "../../modules/user/infrastructure/persistence/prisma/__tests__/user.builder";
import { RegisterUserUseCase } from "../../modules/user/application/use-cases/register-user/register-user.use-case";

describe("Login API (Component Test)", () => {
  let app: Application;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let userBuilder: UserBuilder;

  beforeEach(() => {
    // Create mock dependencies
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      deleteAll: jest.fn(),
    };

    // Create the real use case with mock dependencies
    const loginUseCase = new LoginUseCase(mockUserRepository);

    // Mock the register use case since we don't need it for these tests
    const mockRegisterUseCase = {
      execute: jest.fn(),
      userRepository: mockUserRepository,
      emailService: { sendConfirmationEmail: jest.fn() },
    } as unknown as RegisterUserUseCase;

    // Create the app with the test-configured use cases
    app = createApp({
      registerUserUseCase: mockRegisterUseCase,
      loginUseCase,
    });

    // Initialize test data builder
    userBuilder = new UserBuilder();
  });

  describe("POST /users/login", () => {
    it("should return 200 and user data when credentials are valid", async () => {
      // Arrange
      const validUser = userBuilder
        .withEmail("test@example.com")
        .withPassword("SecurePass1!")
        .withName("Test User")
        .build();

      mockUserRepository.findByEmail.mockResolvedValue(validUser);

      const requestBody = {
        email: "test@example.com",
        password: "SecurePass1!",
      };

      // Act & Assert
      const response = await request(app)
        .post("/users/login")
        .send(requestBody)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty("token");
      expect(typeof response.body.token).toBe("string");
      expect(response.body).toEqual({
        token: expect.any(String),
        user: {
          id: validUser.id.toString(),
          email: validUser.email.value,
          name: validUser.name,
        },
      });

      // Verify repository was called correctly
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        requestBody.email,
      );
    });

    it("should return 401 when credentials are invalid", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const requestBody = {
        email: "nonexistent@example.com",
        password: "WrongPass1!",
      };

      // Act & Assert
      const response = await request(app)
        .post("/users/login")
        .send(requestBody)
        .expect(401);

      expect(response.body).toEqual({
        message: "Invalid email or password",
      });
    });

    it("should return 400 when request body is invalid", async () => {
      // Arrange
      const invalidRequestBody = {
        email: "not-an-email",
        password: "",
      };

      // Act & Assert
      await request(app)
        .post("/users/login")
        .send(invalidRequestBody)
        .expect(400);
    });

    it("should return 500 when an unexpected error occurs", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockRejectedValue(
        new Error("Database error"),
      );

      const requestBody = {
        email: "test@example.com",
        password: "SecurePass1!",
      };

      // Act & Assert
      const response = await request(app)
        .post("/users/login")
        .send(requestBody)
        .expect(500);

      expect(response.body).toEqual({
        message: "An unexpected error occurred",
      });
    });
  });
});
