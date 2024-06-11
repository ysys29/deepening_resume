export class TokensRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findRefreshToken = async (userId) => {
    const existedRefreshToken = await this.prisma.refreshTokens.findUnique({
      where: { userId },
    });

    return existedRefreshToken;
  };

  upsertRefreshToken = async (userId, hashedRefreshToken) => {
    await this.prisma.refreshTokens.upsert({
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
    await this.prisma.refreshTokens.delete({ where: { userId } });
  };
}
