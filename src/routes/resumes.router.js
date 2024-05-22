import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma.utils.js';

const router = express.Router();

router.post('/resumes', authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const { title, content } = req.body;
  const resume = await prisma.resumes.create({
    data: {
      UserId: userId,
      title,
      content,
    },
  });
  return res
    .status(201)
    .json({ messge: '이력서 생성에 성공했습니다.', data: resume });
});

export default router;
