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

  findAllResumes = async (whereCondition) => {
    const resumes = await prisma.resumes.findMany({
      where: whereCondition,
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

  updateResume = async ({ resumeId, title, content, status }) => {
    const updatedResume = await prisma.resumes.update({
      where: { resumeId },
      data: { title, content, status },
    });
    return updatedResume;
  };

  updateResumeAndLog = async (resume, userId, status, reason) => {
    const statusLog = await prisma.$transaction(
      //이력서 상태 변경
      async (tx) => {
        await tx.resumes.update({
          where: { resumeId: resume.resumeId },
          data: {
            status: status.toUpperCase(),
          },
        });

        // throw new Error('akhfkashflasdhjflkhjsdk');
        //이력서 로그 저장
        const statusLog = await tx.resumeHistories.create({
          data: {
            recruiterId: userId,
            resumeId: resume.resumeId,
            oldStatus: resume.status,
            newStatus: status,
            reason,
          },
        });
        return statusLog;
      }
    );
    return statusLog;
  };

  deleteResume = async (resumeId) => {
    await prisma.resumes.delete({ where: { resumeId } });
  };
}
