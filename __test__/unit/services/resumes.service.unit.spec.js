import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ResumesService } from '../../../src/services/resumes.service.js';
import { dummyResumes } from '../../dummies/resumes.dummy';
import { dummyUsers } from '../../dummies/users.dummy.js';
import { dummyLogs } from '../../dummies/statusLog.dummy.js';

const resumesRepository = {
  createResume: jest.fn(),
  findAllResumes: jest.fn(),
  findResume: jest.fn(),
  updateResume: jest.fn(),
  updateResumeAndLog: jest.fn(),
  deleteResume: jest.fn(),
};
const resumeHistoriesRepository = {
  findStatusLogs: jest.fn(),
};

const resumesService = new ResumesService(
  resumesRepository,
  resumeHistoriesRepository
);

//이력서 서비스 파일 테스트
describe('Test resumes.serveice.js', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
  });

  //이력서 생성 메서드 테스트
  describe('createResume method', () => {
    test('이력서 생성', async () => {
      // GIVEN
      const resumeParams = dummyResumes[0];

      // WHEN
      const createdResume = await resumesService.createResume(
        resumeParams.resumeId,
        resumeParams.title,
        resumeParams.content
      );

      // THEN
      expect(resumesRepository.createResume).toHaveBeenCalledTimes(1);
      expect(resumesRepository.createResume).toHaveBeenCalledWith(
        resumeParams.resumeId,
        resumeParams.title,
        resumeParams.content
      );
    });
  });

  //모든 이력서 조회 메서드 테스트
  describe('findAllResumes method', () => {
    test('채용담당자일 때 --모든 이력서 조회', async () => {
      // GIVEN
      const mockResumes = [...dummyResumes].splice(1, 4);
      resumesRepository.findAllResumes.mockResolvedValue(mockResumes);

      // WHEN
      const resumes = await resumesService.findAllResumes(
        null,
        'RECRUITER',
        null,
        null
      );

      // THEN
      //한번만 호출되는지 확인
      expect(resumesRepository.findAllResumes).toHaveBeenCalledTimes(1);
      //채용담당자고, 지원상태 필터링을 안했으니까 둘 다 빈 객체
      expect(resumesRepository.findAllResumes).toHaveBeenCalledWith({}, {});
      expect(resumes).toEqual(
        mockResumes.map((mockResume) => {
          return {
            resumeId: mockResume.resumeId,
            name: mockResume.user.name,
            title: mockResume.title,
            content: mockResume.content,
            status: mockResume.status,
            createdAt: mockResume.createdAt,
            updatedAt: mockResume.updatedAt,
          };
        })
      );
    });

    test('지원자일 때 --자신이 작성한 이력서만 조회', async () => {
      // GIVEN
      const mockUser = dummyUsers[1]; // 지원자
      const mockResumes = [...dummyResumes].splice(1, 2);
      resumesRepository.findAllResumes.mockResolvedValue(mockResumes);

      // WHEN
      const resumes = await resumesService.findAllResumes(
        mockUser.userId,
        mockUser.role,
        null,
        null
      );

      // THEN
      // 유저니까 하나는 {userId}, 하나는 빈객체 --반환 형식 제대로 되는지는 위에서 확인했으니까 패스..
      expect(resumesRepository.findAllResumes).toHaveBeenCalledWith(
        { userId: mockUser.userId },
        {}
      );
    });

    test('오름차순 정렬', async () => {
      // GIVEN
      const mockResumes = [...dummyResumes].splice(1, 4); //오름차순이라고 볼 수 있음
      resumesRepository.findAllResumes.mockResolvedValue(mockResumes);

      // WHEN --오름차순 넣어주고
      const resumes = await resumesService.findAllResumes(
        null,
        'RECRUITER',
        'asc',
        null
      );

      // THEN
      // sort는 findAllResume에 영향을 안 주니까 일단 둘 다 빈 객체로 실행
      expect(resumesRepository.findAllResumes).toHaveBeenCalledWith({}, {});
      //원본이 일단 오름차순이니까 -- 근데 이렇게 하면 리턴값이랑 안맞으니까
      //여기서도 map을... 그럼 채용담당자일 때 확인하는 걸 빼도 될 거 같기도..?
      //아닌가 어차피 mockResumes가 오름차순이니까 굳이 비교할 필요가 없는 건가...
      expect(resumes).toEqual(
        mockResumes.map((mockResume) => {
          return {
            resumeId: mockResume.resumeId,
            name: mockResume.user.name,
            title: mockResume.title,
            content: mockResume.content,
            status: mockResume.status,
            createdAt: mockResume.createdAt,
            updatedAt: mockResume.updatedAt,
          };
        })
      );
    });

    test('내림차순 정렬', async () => {
      // GIVEN
      const mockResumes = [...dummyResumes].splice(1, 4); //얘는 지금 오름차순이니까
      resumesRepository.findAllResumes.mockResolvedValue(mockResumes);
      const mappedResumes = mockResumes.map((mockResume) => {
        return {
          resumeId: mockResume.resumeId,
          name: mockResume.user.name,
          title: mockResume.title,
          content: mockResume.content,
          status: mockResume.status,
          createdAt: mockResume.createdAt,
          updatedAt: mockResume.updatedAt,
        };
      });

      // WHEN
      const resumes = await resumesService.findAllResumes(
        null,
        'RECRUITER',
        'desc',
        null
      );

      // THEN
      // 얘를 오름차순 할 때 확인했으니까 빼도 되나?
      expect(resumesRepository.findAllResumes).toHaveBeenCalledWith({}, {});
      expect(resumes).toEqual(
        mappedResumes.sort((a, b) => {
          return b.createdAt - a.createdAt;
        })
      );
    });

    //이력서 지원 상태 종류
    const statuses = [
      'APPLY',
      'DROP',
      'PASS',
      'INTERVIEW1',
      'INTERVIEW2',
      'FINAL_PASS',
    ];
    //이러면 스테이터스별로 각각 테스트해줌
    test.each(statuses)('지원 상태 별 필터링', async (status) => {
      // GIVEN
      const mockResumes = [...dummyResumes]
        .splice(1, 4)
        .filter((mockResume) => mockResume.status === status);
      resumesRepository.findAllResumes.mockResolvedValue(mockResumes);

      // WHEN
      const resumes = await resumesService.findAllResumes(
        null,
        'RECRUITER',
        null,
        status
      );

      // THEN
      // 지원 상태를 받았으니까 빈 객체 하나에 스테이터스 넣은 객체 하나.
      // 값 비교를 굳이 안해도 되나..? 어차피 필터링 되는걸 역할별에서 확인했으니까..?
      expect(resumesRepository.findAllResumes).toHaveBeenCalledWith(
        {},
        { status }
      );
    });
  });

  //이력서 한개 조회 메서드 테스트
  describe('findResume method', () => {
    test('이력서가 존재하지 않을 때 에러', async () => {
      // GIVEN
      //조회된 이력서가 없게 함
      resumesRepository.findResume.mockResolvedValue(null);
      const nonExistentresumeId = 999;
      const mockUser = dummyUsers[1];

      try {
        // WHEN
        await resumesService.findResume(
          nonExistentresumeId,
          mockUser.userId,
          mockUser.role
        );
      } catch (error) {
        // THEN
        expect(error.message).toEqual('이력서가 존재하지 않습니다.');
      }
    });

    test('이력서는 있지만 접근권한이 없을 때 에러', async () => {
      // GIVEN
      const mockResume = dummyResumes[1]; //userId = 1
      resumesRepository.findResume.mockResolvedValue(mockResume);
      const mockUser = dummyUsers[2]; //userId = 2 --지원자

      try {
        // WHEN
        await resumesService.findResume(
          mockResume.resumeId,
          mockUser.userId,
          mockUser.role
        );
      } catch (error) {
        // THEN
        expect(error.message).toEqual('접근 권한이 없는 이력서입니다.');
      }
    });

    test('이력서가 있고 작성한 유저라 접근권한이 있을 때', async () => {
      // GIVEN
      const mockResume = dummyResumes[1]; //userId = 1
      resumesRepository.findResume.mockResolvedValue(mockResume);
      const mockUser = dummyUsers[1]; //userId = 1 --지원자

      // WHEN
      const resume = await resumesService.findResume(
        mockResume.resumeId,
        mockUser.userId,
        mockUser.role
      );

      // THEN
      expect(resumesRepository.findResume).toHaveBeenCalledTimes(1);
      expect(resumesRepository.findResume).toHaveBeenCalledWith(
        mockResume.resumeId
      );
    });

    test('이력서가 있고 채용 담당자라 접근권한이 있을 때', async () => {
      // GIVEN
      const mockResume = dummyResumes[1]; //userId = 1
      resumesRepository.findResume.mockResolvedValue(mockResume);
      const mockUser = dummyUsers[3]; //userId = 3 --채용담당자

      // WHEN
      const resume = await resumesService.findResume(
        mockResume.resumeId,
        mockUser.userId,
        mockUser.role
      );

      // THEN
      // 여기에서 뭘 비교해야하는 거지?
      expect(resume).toEqual(mockResume);
      expect(resumesRepository.findResume).toHaveBeenCalledWith(
        mockResume.resumeId
      );
    });
  });

  //이력서 수정 메서드 테스트 -- 이력서 검사해서 권한 확인하는 건 이미 findResume에서 했으니까 수정만...?
  describe('updateResume method', () => {
    test('이력서 수정 성공', async () => {
      // GIVEN
      const oldResume = dummyResumes[1]; //수정하기 위한 이력서
      const newTitle = '수정 테스트용 제목';
      const newContent = '수정 테스트용 내용';
      resumesRepository.findResume.mockResolvedValue(oldResume);
      //얘를 설정을 안하면 undefined가 떠서 설정을 해줘야 할거같은데
      resumesRepository.updateResume.mockResolvedValue({
        ...oldResume,
        title: newTitle,
        content: newContent,
      });

      // WHEN
      const updatedResume = await resumesService.updateResume(
        oldResume.userId,
        oldResume.resumeId,
        newTitle,
        newContent
      );

      // THEN
      // 그럼 이걸 하는 의미가 없지 않나...?
      expect(updatedResume).toEqual({
        ...oldResume,
        title: newTitle,
        content: newContent,
      });
      expect(resumesRepository.updateResume).toHaveBeenCalledTimes(1);
      expect(resumesRepository.updateResume).toHaveBeenCalledWith(
        oldResume.resumeId,
        newTitle,
        newContent
      );
    });
  });

  //이력서 삭제 메서드 테스트
  describe('deleteResume method', () => {
    test('이력서 삭제 성공', async () => {
      // GIVEN
      const mockResume = dummyResumes[1];
      resumesRepository.findResume.mockResolvedValue(mockResume);

      // WHEN
      await resumesService.deleteResume(mockResume.userId, mockResume.resumeId);

      // THEN
      expect(resumesRepository.deleteResume).toHaveBeenCalledTimes(1);
      expect(resumesRepository.deleteResume).toHaveBeenCalledWith(
        mockResume.resumeId
      );
    });
  });

  //이력서 상태 변경 메서드 테스트
  describe('updateResumeStatus method', () => {
    test('이력서가 없을 때 에러', async () => {
      // GIVEN
      resumesRepository.findResume.mockResolvedValue(null);
      const nonExistentResumeId = 999;
      const userId = 1;
      const status = 'PASS';
      const reason = '테스트용 이유';

      try {
        // WHEN
        await resumesService.updateResumeStatus(
          userId,
          nonExistentResumeId,
          status,
          reason
        );
      } catch (error) {
        // THEN
        expect(error.message).toEqual('이력서가 존재하지 않습니다.');
      }
    });

    test('이력서 존재하면 상태 변경하고 로그 기록한 후 로그 반환', async () => {
      // GIVEN
      const mockResume = dummyResumes[1];
      const { userId } = dummyUsers[3]; //채용 담당자
      const status = 'DROP';
      const reason = '테스트용 이유';
      resumesRepository.findResume.mockResolvedValue(mockResume);

      // WHEN
      const statusLog = await resumesService.updateResumeStatus(
        userId,
        mockResume.resumeId,
        status,
        reason
      );

      // THEN
      expect(resumesRepository.updateResumeAndLog).toHaveBeenCalledTimes(1);
      expect(resumesRepository.updateResumeAndLog).toHaveBeenCalledWith(
        mockResume,
        userId,
        status,
        reason
      );
    });
  });

  //이력서 상태 수정 로그 조회 메서드 테스트
  describe('findStatusLogs method', () => {
    test('이력서가 없을 때 에러', async () => {
      // GIVEN
      const nonExistentResumeId = 999;
      resumesRepository.findResume.mockResolvedValue(null);

      try {
        // WHEN
        await resumesService.findStatusLogs(nonExistentResumeId);
      } catch (error) {
        // THEN
        expect(error.message).toEqual('이력서가 존재하지 않습니다.');
      }
    });

    test('이력서 존재하면 해당 이력서의 지원 상태 변경 로그 반환', async () => {
      // GIVEN
      const mockResume = dummyResumes[1];
      const mockLogs = dummyLogs;
      resumesRepository.findResume.mockResolvedValue(mockResume);
      resumeHistoriesRepository.findStatusLogs.mockResolvedValue(mockLogs);

      // WHEN
      const logs = await resumesService.findStatusLogs(mockResume.resumeId);

      // THEN
      expect(logs).toEqual(
        mockLogs.map((mockLog) => {
          return {
            resumeHistoryId: mockLog.resumeHistoryId,
            name: mockLog.user.name,
            resumeId: mockLog.resumeId,
            oldStatus: mockLog.oldStatus,
            newStatus: mockLog.newStatus,
            reason: mockLog.reason,
            createdAt: mockLog.createdAt,
          };
        })
      );
      expect(resumeHistoriesRepository.findStatusLogs).toHaveBeenCalledTimes(1);
      expect(resumeHistoriesRepository.findStatusLogs).toHaveBeenCalledWith(
        mockResume.resumeId
      );
    });
  });
});
