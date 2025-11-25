import { Controller } from "../../../../shared/presentation/controller";
import {
  RegisterUserUseCase,
  RegisterUserDTO,
} from "../../application/use-cases/register-user/register-user.use-case";
import { HttpResponse } from "../../../../shared/presentation/http-response";
import { UserAlreadyExistsError } from "../../domain/errors/user-already-exists.error";
import { ValidationError } from "../../domain/errors/validation.error";
import { Request } from "express";

export interface RegisterErrorResponse {
  message: string;
}

export class UserController implements Controller<Request, any> {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  async handle(request: Request): Promise<HttpResponse<any>> {
    const { name, email, password }: RegisterUserDTO = request.body;

    try {
      const result = await this.registerUserUseCase.execute({
        name,
        email,
        password,
      });

      if (result.isSuccess) {
        const user = result.getValue();
        return HttpResponse.created({
          id: user.id.toString(),
          name: user.name,
          email: user.email.value,
        });
      }

      const error = result.error();

      if (error instanceof UserAlreadyExistsError) {
        return HttpResponse.conflict({
          message: error.message,
        });
      }

      if (error instanceof ValidationError) {
        return HttpResponse.badRequest({
          message: error.message,
        });
      }

      if (typeof error === "string") {
        return HttpResponse.badRequest({
          message: error,
        });
      }

      return HttpResponse.serverError({
        message: "An unexpected error occurred",
      });
    } catch (error) {
      return HttpResponse.serverError({
        message: "An unexpected error occurred",
      });
    }
  }
}
