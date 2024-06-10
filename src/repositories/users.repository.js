import { prisma } from '../utils/prisma.utils.js';

export class UsersRepository {
  createUser = async (email, hashedPassword, name) => {
    const createdUser = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return createdUser;
  };

  findUserById = async (userId) => {
    const user = await prisma.users.findUnique({ where: { userId } });

    return user;
  };

  findUserByEmail = async (email) => {
    const user = await prisma.users.findUnique({ where: { email } });

    return user;
  };

  findRefreshToken = async (userId) => {
    const existedRefreshToken = await prisma.refreshTokens.findUnique({
      where: { userId },
    });

    return existedRefreshToken;
  };

  addRefreshToken = async (userId, hashedRefreshToken) => {
    await prisma.refreshTokens.create({
      data: {
        userId,
        token: hashedRefreshToken,
      },
    });
  };

  updateRefreshToken = async (userId, hashedRefreshToken) => {
    await prisma.refreshTokens.update({
      where: { userId },
      data: { token: hashedRefreshToken },
    });
  };
}
