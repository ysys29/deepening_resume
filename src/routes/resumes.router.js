import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma.utils.js';

const router = express.Router();

//이력서 생성 api
router.post('/resumes', authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const { title, content, status } = req.body;
  const resume = await prisma.resumes.create({
    data: {
      UserId: userId,
      title,
      content,
      status,
    },
  });
  return res
    .status(201)
    .json({ messge: '이력서 생성에 성공했습니다.', data: resume });
});

//이력서 목록 조회 api
router.get('/resumes', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const resume = await prisma.resumes.findMany({
      where: { UserId: userId },
      select: {
        resumeId: true,
        title: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        User: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res
      .status(200)
      .json({ message: '이력서 조회에 성공했습니다.', data: resume });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: error.message ?? '무슨 에러람' });
  }
});

//이력서 상세 조회 api
router.get('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { resumeId } = req.params;
    const resume = await prisma.resumes.findFirst({
      where: { UserId: userId, resumeId: +resumeId },
      select: {
        resumeId: true,
        title: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        User: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!resume) {
      return res.status(400).json({ errorMessage: '존재하지 않는 이력서' });
    }

    return res
      .status(200)
      .json({ message: '이력서 상세 조회 성공', data: resume });
  } catch (error) {
    next(error);
  }
});

export default router;
