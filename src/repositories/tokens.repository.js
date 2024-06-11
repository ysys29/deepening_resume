import { prisma } from '../utils/prisma.utils.js';

export class TokensRepository {
  findRefreshToken = async (userId) => {
    const existedRefreshToken = await prisma.refreshTokens.findUnique({
      where: { userId },
    });

    return existedRefreshToken;
  };

  upsertRefreshToken = async (userId, hashedRefreshToken) => {
    await prisma.refreshTokens.upsert({
      where: { userId },
      update: {
        token: hashedRefreshToken,
      },
      create: {
        userId,
        token: hashedRefreshToken,
      },
    });
  };

  deleteRefreshToken = async (userId) => {
    await prisma.refreshTokens.delete({ where: { userId } });
  };
}
