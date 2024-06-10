import { ResumesRepository } from '../repositories/resumes.repository.js';
import { HttpError } from '../errors/http.error.js';

export class ResumesService {
  resumesRepository = new ResumesRepository();

  //이력서 생성
  createResume = async (userId, title, content) => {
    const resume = await this.resumesRepository.createResume(
      userId,
      title,
      content
    );

    return resume;
  };

  //이력서 찾기
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
}
