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

  findResume = async (resumeId) => {
    const resume = await prisma.resumes.findUnique({ where: { resumeId } });

    return resume;
  };

  updateResume = async (resumeId, title, content) => {
    const updatedResume = await prisma.resumes.update({
      where: { resumeId },
      data: { title, content },
    });
    return updatedResume;
  };
}
