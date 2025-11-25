import { RegisterUserUseCase } from "./register-user.use-case";
import { UserRepository } from "../../../domain/user.repository";
import { EmailService } from "../../../domain/email.service";
import { UserAlreadyExistsError } from "../../../domain/errors/user-already-exists.error";
import { ValidationError } from "../../../domain/errors/validation.error";
import { User } from "../../../domain/user.entity";
import { UserBuilder } from "../../../infrastructure/persistence/prisma/__tests__/user.builder";

describe("RegisterUserUseCase (Sociable Unit Test)", () => {
  let useCase: RegisterUserUseCase;
  let userRepository: UserRepository;
  let emailService: EmailService;
  let userBuilder: UserBuilder;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      deleteAll: jest.fn(),
    };

    emailService = {
      sendConfirmationEmail: jest.fn(),
    };

    useCase = new RegisterUserUseCase(userRepository, emailService);
    userBuilder = new UserBuilder();
  });

  describe("execute", () => {
    it("should successfully register a new user when valid input is provided", async () => {
      const registerUserDTO = {
        email: "test@example.com",
        password: "ValidPassword123!",
        name: "Test User",
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.save as jest.Mock).mockImplementation(() =>
        Promise.resolve(),
      );
      (emailService.sendConfirmationEmail as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await useCase.execute(registerUserDTO);

      expect(result.isSuccess).toBe(true);

      const user = result.getValue();
      expect(user).toBeInstanceOf(User);
      expect(user.email.value).toBe("test@example.com");
      expect(user.name).toBe("Test User");
      expect(user.isEmailVerified).toBe(false);

      // Minimal interaction verification for critical side effects only
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(1);
    });

    it("should return error when user already exists", async () => {
      const email = "existing@example.com";
      const password = "ValidPassword123!";
      const name = "Existing User";

      const existingUser = userBuilder
        .withName(name)
        .withEmail(email)
        .withPassword(password)
        .build();
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(existingUser);

      const result = await useCase.execute({ name, email, password });

      expect(result.isFailure).toBe(true);
      expect(result.error()).toBeInstanceOf(UserAlreadyExistsError);
      expect((result.error() as UserAlreadyExistsError).message).toBe(
        "User with this email already exists",
      );

      expect(userRepository.save).not.toHaveBeenCalled();
      expect(emailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });

    it("should validate email format", async () => {
      const email = "invalid-email";
      const password = "ValidPassword123!";
      const name = "Test User";

      const result = await useCase.execute({ name, email, password });

      expect(result.isFailure).toBe(true);
      expect(result.error()).toBeInstanceOf(ValidationError);
      expect((result.error() as ValidationError).message).toBe(
        "Invalid email format",
      );

      expect(userRepository.save).not.toHaveBeenCalled();
      expect(emailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });

    it("should validate password requirements", async () => {
      const email = "test@example.com";
      const password = "weak";
      const name = "Test User";

      const result = await useCase.execute({ name, email, password });

      expect(result.isFailure).toBe(true);
      expect(result.error()).toBeInstanceOf(ValidationError);
      expect((result.error() as ValidationError).message).toBe(
        "Password must be at least 8 characters long",
      );

      expect(userRepository.save).not.toHaveBeenCalled();
      expect(emailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });

    it("should validate name requirements", async () => {
      const email = "test@example.com";
      const password = "ValidPassword123!";
      const name = "";

      const result = await useCase.execute({ name, email, password });

      expect(result.isFailure).toBe(true);
      expect(result.error()).toBeInstanceOf(ValidationError);
      expect((result.error() as ValidationError).message).toBe(
        "Name is required.",
      );

      expect(userRepository.save).not.toHaveBeenCalled();
      expect(emailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });
  });
});
