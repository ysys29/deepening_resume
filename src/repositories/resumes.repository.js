import { prisma } from '../utils/prisma.utils.js';

export class ResumesRepository {
  createResume = async (userId, title, content) => {
    const resume = await prisma.resumes.create({
      data: {
        userId,
        title,
        content,
      },
    });

    return resume;
  };
}
