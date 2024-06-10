import { prisma } from '../utils/prisma.utils.js';

export class ResumeHistoriesRepository {
  findStatusLogs = async (resumeId) => {
    const logs = await prisma.resumeHistories.findMany({
      where: { resumeId },
      include: {
        user: true,
      },
    });

    return logs;
  };
}
