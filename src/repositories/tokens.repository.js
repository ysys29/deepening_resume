import { prisma } from '../utils/prisma.utils.js';

export class TokensRepository {
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

  deleteRefreshToken = async (userId) => {
    await prisma.refreshTokens.delete({ where: { userId } });
  };
}
