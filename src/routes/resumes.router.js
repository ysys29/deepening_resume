import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma.utils.js';

const router = express.Router();

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

export default router;
