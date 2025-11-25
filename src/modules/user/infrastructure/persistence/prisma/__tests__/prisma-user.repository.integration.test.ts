import { PrismaClient } from "@prisma/client";
import { PrismaUserRepository } from "../prisma-user.repository";
import { User } from "../../../../domain/user.entity";
import { UniqueEntityID } from "../../../../../../shared/domain/unique-entity-id";
import { UserBuilder } from "./user.builder";

describe("PrismaUserRepository (Narrow Integration)", () => {
  let prisma: PrismaClient;
  let userRepository: PrismaUserRepository;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    userRepository = new PrismaUserRepository(prisma);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("save", () => {
    it("should save a new user to the database", async () => {
      const newUser = new UserBuilder()
        .withEmail("new.user@example.com")
        .withPassword("ValidPass123!")
        .build();

      await userRepository.save(newUser);

      const savedUserInDb = await prisma.user.findUnique({
        where: { email: "new.user@example.com" },
      });
      expect(savedUserInDb).not.toBeNull();
      expect(savedUserInDb?.id).toBe(newUser.id.toString());
      expect(savedUserInDb?.email).toBe(newUser.email.value);
    });

    it("should update an existing user in the database", async () => {
      const email = "existing.user@example.com";
      const existingUser = new UserBuilder()
        .withEmail(email)
        .withIsEmailVerified(false)
        .build();
      await userRepository.save(existingUser);

      const updatedUser = new UserBuilder()
        .withEmail(email)
        .withIsEmailVerified(true)
        .withId(existingUser.id)
        .build();
      await userRepository.save(updatedUser);

      const updatedUserInDb = await prisma.user.findUnique({
        where: { id: existingUser.id.toString() },
      });
      expect(updatedUserInDb).not.toBeNull();
      expect(updatedUserInDb?.isEmailVerified).toBe(true);
    });
  });

  describe("findByEmail", () => {
    it("should return a user entity when a user with the given email exists", async () => {
      const existingUser = new UserBuilder()
        .withEmail("find.me@example.com")
        .build();
      await userRepository.save(existingUser);

      const foundUser = await userRepository.findByEmail("find.me@example.com");

      expect(foundUser).toBeInstanceOf(User);
      expect(foundUser?.id.equals(existingUser.id)).toBe(true);
    });

    it("should return null when no user with the given email exists", async () => {
      const foundUser = await userRepository.findByEmail(
        "non.existent@example.com",
      );

      expect(foundUser).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return a user entity when a user with the given id exists", async () => {
      const id = new UniqueEntityID();
      const existingUser = new UserBuilder().withId(id).build();
      await userRepository.save(existingUser);

      const foundUser = await userRepository.findById(id.toString());

      expect(foundUser).toBeInstanceOf(User);
      expect(foundUser?.id.equals(id)).toBe(true);
    });

    it("should return null when no user with the given id exists", async () => {
      const foundUser = await userRepository.findById(
        new UniqueEntityID().toString(),
      );

      expect(foundUser).toBeNull();
    });
  });
});
