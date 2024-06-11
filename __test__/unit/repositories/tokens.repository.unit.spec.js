import { beforeEach, describe, jest, test, expect } from '@jest/globals';
import { TokensRepository } from '../../../src/repositories/tokens.repository.js';

const mockPrisma = {
  refreshTokens: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  },
};

const tokensRepository = new TokensRepository(mockPrisma);

describe('tokensRepository Unit Test --토큰 관련 db 조회', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다
  });

  test('findRefreshToken Method --저장소에 해당 유저 아이디의 리프레시 토큰이 있는지 검색', async () => {
    // GIVEN
    const userId = 1;

    // WHEN
    await tokensRepository.findRefreshToken(userId);

    // THEN
    expect(mockPrisma.refreshTokens.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.refreshTokens.findUnique).toHaveBeenCalledWith({
      where: { userId },
    });
  });

  test('upsertRefreshToken Method --저장소에 토큰이 있으면 업뎃, 없으면 생성', async () => {
    // GIVEN
    const userId = 1;
    const hashedRefreshToken =
      '$2b$10$5QtZln.F0uZvW5TKNHif9ebXCqSqR8iCFB2WAE6qag5SB4MSD9pe6';

    // WHEN
    await tokensRepository.upsertRefreshToken(userId, hashedRefreshToken);

    // THEN
    expect(mockPrisma.refreshTokens.upsert).toHaveBeenCalledTimes(1);
    expect(mockPrisma.refreshTokens.upsert).toHaveBeenCalledWith({
      where: { userId },
      update: {
        token: hashedRefreshToken,
      },
      create: {
        userId,
        token: hashedRefreshToken,
      },
    });
  });

  test('deleteRefreshToken Method --리프레시 토큰 저장소에서 토큰 삭제', async () => {
    // GIVEN
    const userId = 1;

    // WHEN
    await tokensRepository.deleteRefreshToken(userId);

    // THEN
    expect(mockPrisma.refreshTokens.delete).toHaveBeenCalledTimes(1);
    expect(mockPrisma.refreshTokens.delete).toHaveBeenCalledWith({
      where: { userId },
    });
  });
});
