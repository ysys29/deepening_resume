import { ResumesRepository } from '../repositories/resumes.repository.js';

export class ResumesService {
  resumesRepository = new ResumesRepository();

  createResume = async (userId, title, content) => {
    const resume = await this.resumesRepository.createResume(
      userId,
      title,
      content
    );

    return resume;
  };
}
