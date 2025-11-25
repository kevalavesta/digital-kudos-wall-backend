import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../../../domain/user.repository";
import { User } from "../../../domain/user.entity";
import { UserMapper } from "./mappers/user.mapper";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(emailValue: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email: emailValue },
    });

    if (!prismaUser) {
      return null;
    }

    return UserMapper.toDomain(prismaUser);
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!prismaUser) {
      return null;
    }

    return UserMapper.toDomain(prismaUser);
  }

  async save(user: User): Promise<void> {
    const hashedPassword = await user.password.hashPassword();
    const userWithHashedPassword = User.create(
      {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        isEmailVerified: user.isEmailVerified,
      },
      user.id,
    ).getValue();

    const data = UserMapper.toPersistence(userWithHashedPassword);

    await this.prisma.user.upsert({
      where: { id: user.id.toString() },
      update: data,
      create: data,
    });
  }

  async deleteAll(): Promise<void> {
    await this.prisma.user.deleteMany({});
  }
}
