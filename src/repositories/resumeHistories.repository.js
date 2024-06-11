export class ResumeHistoriesRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findStatusLogs = async (resumeId) => {
    const logs = await this.prisma.resumeHistories.findMany({
      where: { resumeId },
      include: {
        user: true,
      },
    });

    return logs;
  };
}
