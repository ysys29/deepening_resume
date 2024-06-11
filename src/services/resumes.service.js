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

  //이력서 상세 조회
  //그럼 인자 보내는 순서를 바꾸면 되려나?
  //근데 이러면 수정 삭제시에 userId를 안넘겨서 누구도 열람권한이 없게됨.
  //userId를 넘겨주면, 아 롤은 안넘겨줘서 채용담당자가 수정을 못하려나?
  findResume = async (resumeId, userId, role) => {
    console.log('2222---', resumeId);
    const resume = await this.resumesRepository.findResume(resumeId);

    if (!resume) {
      throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    }

    // 둘 다 해당되어야 들어가는 거니까 작성자는 수정이 가능하고,
    //롤은 안넘겨서 채용담당자는 수정, 삭제가 불가능한거고?
    if (role !== 'RECRUITER' && resume.userId !== userId) {
      throw new HttpError.Forbidden('접근 권한이 없는 이력서입니다.');
    }

    return resume;
  };

  // //특정 이력서 조회(수정, 삭제용)
  // findResumeByResumeId = async (resumeId) => {
  //   const resume = await this.resumesRepository.findResume(resumeId);

  //   return resume;
  // };

  //이력서 수정
  updateResume = async (userId, resumeId, title, content) => {
    // if (!resume) {
    //   throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    // }
    //그럼 여기도 필요가 없어질거같은데
    // if (resume.userId !== userId) {
    //   throw new HttpError.Forbidden('수정 권한이 없는 이력서입니다.');
    // }

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
    // if (!resume) {
    //   throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    // }
    // if (resume.userId !== userId) {
    //   throw new HttpError.Forbidden('삭제 권한이 없는 이력서입니다.');
    // }

    await this.findResume(resumeId, userId);

    await this.resumesRepository.deleteResume(resumeId);
  };

  //이력서 상태 변경
  updateResumeStatus = async (userId, resumeId, status, reason) => {
    const resume = await this.resumesRepository.findResume(resumeId);
    if (!resume) {
      throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    }

    //이력서 상태 변경
    await this.resumesRepository.updateResume({
      resumeId,
      status: status.toUpperCase(),
    });

    //이력서 상태 변경 로그 기록
    const statusLog =
      await this.resumeHistoriesRepository.createResumeStatusLog(
        userId,
        resume,
        status.toUpperCase(),
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
