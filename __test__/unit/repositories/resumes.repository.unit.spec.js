import { beforeEach, describe, jest, test, expect } from '@jest/globals';
import { ResumesRepository } from '../../../src/repositories/resumes.repository';
import { dummyResumes } from '../../dummies/resumes.dummy';

const mockPrisma = {
  resumes: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
};

const resumesRepository = new ResumesRepository(mockPrisma);

describe('resumesRepository Unit Test --이력서 관련 db 조회', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다
  });

  test('createResume Method --이력서 생성', async () => {
    // GIVEN
    const createResumeParams = dummyResumes[0];

    // WHEN
    await resumesRepository.createResume(
      createResumeParams.authorId,
      createResumeParams.title,
      createResumeParams.content
    );

    // THEN
    expect(mockPrisma.resumes.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.resumes.create).toHaveBeenCalledWith({
      data: {
        userId: createResumeParams.authorId,
        title: createResumeParams.title,
        content: createResumeParams.content,
      },
    });
  });

  test('findAllResumes Method -- db에서 모든 이력서 조회(지원자는 자기것만, 채용담당자는 모두)', async () => {
    // GIVEN
    const whereCondition = { userId: 1 };
    const statusCondition = {};

    // WHEN
    await resumesRepository.findAllResumes(whereCondition, statusCondition);

    // THEN
    expect(mockPrisma.resumes.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.resumes.findMany).toHaveBeenCalledWith({
      where: { ...whereCondition, ...statusCondition },
      include: {
        user: true,
      },
    });
  });

  test('findResume Method -- db에서 특정 이력서 하나만 찾기', async () => {
    // GIVEN
    const resumeId = 1;

    // WHEN
    await resumesRepository.findResume(resumeId);

    // THEN
    expect(mockPrisma.resumes.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.resumes.findUnique).toHaveBeenCalledWith({
      where: { resumeId },
    });
  });

  test('updateResume Method -- 해당 이력서id의 이력서 수정', async () => {
    // GIVEN
    const resumeId = 1;
    const title = '테스트용 제목';
    const content = '테스트용 내용';

    // WHEN
    await resumesRepository.updateResume(resumeId, title, content);

    // THEN
    expect(mockPrisma.resumes.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.resumes.update).toHaveBeenCalledWith({
      where: { resumeId },
      data: { title, content },
    });
  });

  test('updateResumeAndLog Method --이력서의 상태 변경 및 로그 기록', async () => {
    // GIVEN
    const resume = dummyResumes[1];
    const userId = 3;
    const status = 'apply';
    const reason = '변경 이유';

    // WHEN
    await resumesRepository.updateResumeAndLog(
      resume,
      userId,
      status.toUpperCase(),
      reason
    );

    // THEN
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });

  test('deleteResume Method --해당 이력서id의 이력서 삭제', async () => {
    // GIVEN
    const resumeId = 1;

    // WHEN
    await resumesRepository.deleteResume(resumeId);

    // THEN
    expect(mockPrisma.resumes.delete).toHaveBeenCalledTimes(1);
    expect(mockPrisma.resumes.delete).toHaveBeenCalledWith({
      where: { resumeId },
    });
  });
});
