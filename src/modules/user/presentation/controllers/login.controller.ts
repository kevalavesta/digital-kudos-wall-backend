import { Controller } from "../../../../shared/presentation/controller";
import {
  LoginUseCase,
  LoginDTO,
} from "../../application/use-cases/login/login.use-case";
import { InvalidCredentialsError } from "../../domain/errors/invalid-credentials.error";
import { HttpResponse } from "../../../../shared/presentation/http-response";
import { Request } from "express";
import { ValidationError } from "../../domain/errors/validation.error";

export interface LoginErrorResponse {
  message: string;
}

export class LoginController implements Controller<Request, any> {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  async handle(request: Request): Promise<HttpResponse<any>> {
    const { email, password }: LoginDTO = request.body;

    try {
      const result = await this.loginUseCase.execute({ email, password });

      if (result.isFailure) {
        const error = result.error();

        if (error instanceof ValidationError) {
          return HttpResponse.badRequest({
            message: error.message,
          });
        }

        return HttpResponse.unauthorized({
          message:
            error instanceof InvalidCredentialsError
              ? error.message
              : "Invalid email or password",
        });
      }

      return HttpResponse.ok(result.getValue());
    } catch (error) {
      console.error("Unexpected error during login:", error);
      return HttpResponse.serverError({
        message: "An unexpected error occurred",
      });
    }
  }
}
