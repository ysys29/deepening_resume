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

  //이력서 수정
  updateResume = async (userId, resumeId, title, content) => {
    const resume = await this.resumesRepository.findResume(resumeId);
    console.log(resume);
    console.log(userId);
    if (!resume) {
      throw new HttpError.NotFound('이력서가 존재하지 않습니다.');
    }
    if (resume.userId !== userId) {
      throw new HttpError.Forbidden('수정 권한이 없는 이력서입니다.');
    }

    const updatedResume = await this.resumesRepository.updateResume(
      resumeId,
      title,
      content
    );

    return updatedResume;
  };
}
