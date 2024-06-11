import { beforeEach, describe, jest, test, expect } from '@jest/globals';
import { ResumeHistoriesRepository } from '../../../src/repositories/resumeHistories.repository.js';

const mockPrisma = {
  resumeHistories: {
    findMany: jest.fn(),
  },
};

const resumeHistoriesRepository = new ResumeHistoriesRepository(mockPrisma);

describe('resumeHistoriesRepository Unit Test --이력서 로그 관련 db조회', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다
  });

  test('findStatusLogs Method -- 특정 이력서의 상태변경 로그 조회', async () => {
    // GIVEN
    const resumeId = 1;

    // WHEN
    await resumeHistoriesRepository.findStatusLogs(resumeId);

    // THEN
    expect(mockPrisma.resumeHistories.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.resumeHistories.findMany).toHaveBeenCalledWith({
      where: { resumeId },
      include: {
        user: true,
      },
    });
  });
});
