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

  //여기가 기존 이력서 수정하던 곳인데, 이력서 상태 수정도 여기서 하는게 나은지
  //아님 분리가 나은지
  //이력서 상태 변경은 resumeId, status.toUpperCase() 이렇게 보내고,
  //이력서 수정은 resume.resumeId,title, content 이렇게 보내는데 그럼 오류가 나야되는 거 아닌가??????
  //근데 왜 잘 되지..?
  //오브젝트로 받는거 == 확인해보기
  updateResume = async ({ resumeId, title, content, status }) => {
    const updatedResume = await prisma.resumes.update({
      where: { resumeId },
      data: { title, content, status },
    });
    return updatedResume;
  };

  deleteResume = async (resumeId) => {
    await prisma.resumes.delete({ where: { resumeId } });
  };
}
