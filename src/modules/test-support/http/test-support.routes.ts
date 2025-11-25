import { Router } from "express";
import { TestSupportController } from "./test-support.controller";
import { CreateTestUserUseCase } from "../application/CreateTestUserUseCase";
import { CleanupTestDataUseCase } from "../application/CleanupTestDataUseCase";
import { PrismaUserRepository } from "../../user/infrastructure/persistence/prisma/prisma-user.repository";
import { prisma } from "../../../shared/infrastructure/persistence/prisma/client";

const userRepository = new PrismaUserRepository(prisma);
const createTestUserUseCase = new CreateTestUserUseCase(userRepository);
const cleanupTestDataUseCase = new CleanupTestDataUseCase(userRepository);
const testSupportController = new TestSupportController(
  createTestUserUseCase,
  cleanupTestDataUseCase,
);

const testSupportRouter = Router();

testSupportRouter.post("/users", (req, res) =>
  testSupportController.createUser(req, res),
);
testSupportRouter.delete("/cleanup", (req, res) =>
  testSupportController.cleanup(req, res),
);
testSupportRouter.get("/verify-email", (req, res) =>
  testSupportController.verifyEmailSent(req, res),
);

export { testSupportRouter };
