import { UseCase } from "../../../../../shared/core/use-case";
import { Result } from "../../../../../shared/core/result";
import { UserRepository } from "../../../domain/user.repository";
import { InvalidCredentialsError } from "../../../domain/errors/invalid-credentials.error";
import { ValidationError } from "../../../domain/errors/validation.error";
import { Email } from "../../../domain/value-objects/email";

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

type LoginError = InvalidCredentialsError | ValidationError;

export class LoginUseCase
  implements UseCase<LoginDTO, Result<LoginResponse, LoginError>>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: LoginDTO): Promise<Result<LoginResponse, LoginError>> {
    const emailResult = Email.create(request.email);
    if (emailResult.isFailure) {
      return Result.fail(new ValidationError("Invalid email format"));
    }

    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      return Result.fail(new InvalidCredentialsError());
    }

    const isPasswordValid = await user.password.comparePassword(
      request.password,
    );
    if (!isPasswordValid) {
      return Result.fail(new InvalidCredentialsError());
    }

    // For now, we'll use a simple token. In a real app, you'd use JWT or similar
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

    return Result.ok<LoginResponse, LoginError>({
      token,
      user: {
        id: user.id.toString(),
        email: user.email.value,
        name: user.name,
      },
    });
  }
}
