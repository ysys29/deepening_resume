import { HttpError } from '../errors/http.error.js';

export class ResumesService {
  constructor(resumesRepository, resumeHistoriesRepository) {
    this.resumesRepository = resumesRepository;
    this.resumeHistoriesRepository = resumeHistoriesRepository;
  }

  //이력서 생성
  createResume = async (userId, title, content) => {
    //이력서 생성 후 생성된 이력서 반환
    const resume = await this.resumesRepository.createResume(
      userId,
      title,
      content
    );

    return resume;
  };

  //모든 이력서 조회
  findAllResumes = async (userId, role, sort, status) => {
    // 유저의 역할에 따라 where 조건을 줌
    const whereCondition = role === 'RECRUITER' ? {} : { userId };
    // 쿼리에 입력한 값대로 이력서를 필터링함
    const statusCondition = status ? { status: status.toUpperCase() } : {};
    // 이력서 찾기
    const resumes = await this.resumesRepository.findAllResumes(
      whereCondition,
      statusCondition
    );

    // 쿼리에 입력한 값대로 정렬
    const sortType = sort ? sort.toLowerCase() : 'desc';

    if (sortType === 'desc') {
      resumes.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortType === 'asc') {
      resumes.sort((a, b) => a.createdAt - b.createdAt);
    }

    // 값을 정리해서 반환
    return resumes.map((resume) => {
      return {
        resumeId: resume.resumeId,
        name: resume.user.name,
        title: resume.title,
        content: resume.content,
        status: resume.status,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      };
    });
  };

  findResume = async (resumeId, userId, role) => {
    // 이력서 검색
    const resume = await this.resumesRepository.findResume(resumeId);

    // 이력서 없으면 오류
    if (!resume) {
      throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    }

    // 이력서가 있지만 접근 권한이 없으면 오류
    if (role !== 'RECRUITER' && resume.userId !== userId) {
      throw new HttpError.Forbidden('접근 권한이 없는 이력서입니다.');
    }

    return resume;
  };

  //이력서 수정
  updateResume = async (userId, resumeId, title, content) => {
    await this.findResume(resumeId, userId);

    const updatedResume = await this.resumesRepository.updateResume(
      resumeId,
      title,
      content
    );

    return updatedResume;
  };

  //이력서 삭제
  deleteResume = async (userId, resumeId) => {
    await this.findResume(resumeId, userId);

    await this.resumesRepository.deleteResume(resumeId);
  };

  //이력서 상태 변경
  updateResumeStatus = async (userId, resumeId, status, reason) => {
    const resume = await this.resumesRepository.findResume(resumeId);
    if (!resume) {
      throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    }

    const statusLog = await this.resumesRepository.updateResumeAndLog(
      resume,
      userId,
      status,
      reason
    );

    return statusLog;
  };

  //이력서 상태 수정 로그 조회
  findStatusLogs = async (resumeId) => {
    const resume = await this.resumesRepository.findResume(resumeId);

    if (!resume) {
      throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    }

    const logs = await this.resumeHistoriesRepository.findStatusLogs(resumeId);

    return logs.map((log) => {
      return {
        resumeHistoryId: log.resumeHistoryId,
        name: log.user.name, //채용담당자 이름
        resumeId: log.resumeId,
        oldStatus: log.oldStatus,
        newStatus: log.newStatus,
        reason: log.reason,
        createdAt: log.createdAt,
      };
    });
  };
}
