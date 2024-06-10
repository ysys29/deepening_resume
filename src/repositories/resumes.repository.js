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

  findAllResumes = async (userId) => {
    const resumes = await prisma.resumes.findMany({
      where: { userId },
      include: {
        user: true,
      },
    });

    return resumes;
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

  deleteResume = async (resumeId) => {
    await prisma.resumes.delete({ where: { resumeId } });
  };
}
