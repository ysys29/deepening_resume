import { ResumesRepository } from '../repositories/resumes.repository.js';
import { ResumeHistoriesRepository } from '../repositories/resumeHistories.repository.js';
import { HttpError } from '../errors/http.error.js';

export class ResumesService {
  resumesRepository = new ResumesRepository();
  resumeHistoriesRepository = new ResumeHistoriesRepository();

  //이력서 생성
  createResume = async (userId, title, content) => {
    const resume = await this.resumesRepository.createResume(
      userId,
      title,
      content
    );

    return resume;
  };

  //모든 이력서 조회
  findAllResumes = async (userId, role, sort) => {
    const roleType = role === 'RECRUITER' ? {} : { userId };
    const resumes = await this.resumesRepository.findAllResumes(roleType);

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

  //특정 이력서 조회
  findResume = async (resumeId) => {
    const resume = await this.resumesRepository.findResume(resumeId);

    return resume;
  };

  //이력서 수정
  updateResume = async (userId, resume, title, content) => {
    if (!resume) {
      throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    }
    if (resume.userId !== userId) {
      throw new HttpError.Forbidden('수정 권한이 없는 이력서입니다.');
    }

    const updatedResume = await this.resumesRepository.updateResume(
      resume.resumeId,
      title,
      content
    );

    return updatedResume;
  };

  //이력서 삭제
  deleteResume = async (userId, resume) => {
    if (!resume) {
      throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    }
    if (resume.userId !== userId) {
      throw new HttpError.Forbidden('삭제 권한이 없는 이력서입니다.');
    }

    await this.resumesRepository.deleteResume(resume.resumeId);
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
