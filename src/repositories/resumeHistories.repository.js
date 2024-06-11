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

  //이력서 상태 변경 로그 생성
  // createResumeStatusLog = async (userId, resume, status, reason) =>
  //   await prisma.resumeHistories.create({
  //     data: {
  //       recruiterId: userId,
  //       resumeId: resume.resumeId,
  //       oldStatus: resume.status,
  //       newStatus: status,
  //       reason,
  //     },
  //   });
}
