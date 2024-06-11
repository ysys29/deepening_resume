import { HttpError } from '../errors/http.error.js';

export class ResumesService {
  constructor(resumesRepository, resumeHistoriesRepository) {
    this.resumesRepository = resumesRepository;
    this.resumeHistoriesRepository = resumeHistoriesRepository;
  }

  //이력서 생성
  createResume = async (userId, title, content) => {
    console.log('22222222222222222222');
    const resume = await this.resumesRepository.createResume(
      userId,
      title,
      content
    );

    return resume;
  };

  //모든 이력서 조회
  findAllResumes = async (userId, role, sort) => {
    const whereCondition = role === 'RECRUITER' ? {} : { userId };
    const resumes = await this.resumesRepository.findAllResumes(whereCondition);

    const sortType = sort ? sort.toLowerCase() : 'desc';

    if (sortType === 'desc') {
      resumes.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortType === 'asc') {
      resumes.sort((a, b) => a.createdAt - b.createdAt);
    }

    return resumes.map((resumes) => {
      return {
        resumeId: resumes.resumeId,
        name: resumes.user.name,
        title: resumes.title,
        content: resumes.content,
        status: resumes.status,
        createdAt: resumes.createdAt,
        updatedAt: resumes.updatedAt,
      };
    });
  };

  findResume = async (resumeId, userId, role) => {
    const resume = await this.resumesRepository.findResume(resumeId);

    if (!resume) {
      throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    }

    if (role !== 'RECRUITER' && resume.userId !== userId) {
      throw new HttpError.Forbidden('접근 권한이 없는 이력서입니다.');
    }

    return resume;
  };

  //이력서 수정
  updateResume = async (userId, resumeId, title, content) => {
    await this.findResume(resumeId, userId);

    const updatedResume = await this.resumesRepository.updateResume({
      resumeId,
      title,
      content,
    });

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

    // //이력서 상태 변경
    // await this.resumesRepository.updateResume({
    //   resumeId,
    //   status: status.toUpperCase(),
    // });

    // //이력서 상태 변경 로그 기록
    // const statusLog =
    //   await this.resumeHistoriesRepository.createResumeStatusLog(
    //     userId,
    //     resume,
    //     status.toUpperCase(),
    //     reason
    //   );

    const statusLog = await this.resumesRepository.updateResumeAndLog(
      resume,
      userId,
      status,
      reason
    );

    return statusLog;
  };

  //이력서 상태 수정 로그
  findStatusLogs = async (resumeId) => {
    const resume = await this.resumesRepository.findResume(resumeId);

    if (!resume) {
      throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    }

    const logs = await this.resumeHistoriesRepository.findStatusLogs(resumeId);

    return logs.map((log) => {
      return {
        resumeHistoryId: log.resumeHistoryId,
        name: log.user.name,
        resumeId: log.resumeId,
        oldStatus: log.oldStatus,
        newStatus: log.newStatus,
        reason: log.reason,
        createdAt: log.createdAt,
      };
    });
  };
}
