import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma.utils.js';
import joiSchemas from '../schemas/joi_schemas.js';
import recruiterMiddleware from '../middlewares/recruiter.middleware.js';
import { Prisma } from '@prisma/client';

const router = express.Router();

//이력서 생성 api
router.post('/resumes', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { title, content } = req.body;

    await joiSchemas.postSchema.validateAsync({ title, content });

    const resume = await prisma.resumes.create({
      data: {
        userId,
        title,
        content,
      },
    });
    return res
      .status(201)
      .json({ messge: '이력서 생성에 성공했습니다.', resume });
  } catch (error) {
    next(error);
  }
});

//이력서 목록 조회 api
router.get('/resumes', authMiddleware, async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const { sort, status } = req.query;

    const querySort = sort && sort.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const queryStatus = status ? { status: status.toUpperCase() } : {};

    //로그인 한 사람이 recruiter일 때
    const userRole = role !== 'RECRUITER' ? { userId } : {};

    const resume = await prisma.resumes.findMany({
      where: { ...userRole, ...queryStatus },
      select: {
        resumeId: true,
        user: {
          select: {
            name: true,
          },
        },
        title: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: querySort,
      },
    });

    return res
      .status(200)
      .json({ message: '이력서 조회에 성공했습니다.', resume });
  } catch (error) {
    next(error);
  }
});

//이력서 상세 조회 api
router.get('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const { resumeId } = req.params;

    const userRole =
      role !== 'RECRUITER'
        ? { userId, resumeId: +resumeId }
        : { resumeId: +resumeId };

    const resume = await prisma.resumes.findFirst({
      where: userRole,
      select: {
        resumeId: true,
        user: {
          select: {
            name: true,
          },
        },
        title: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!resume) {
      throw new Error('이력서가 존재하지 않습니다.');
    }

    return res.status(200).json({ message: '이력서 상세 조회 성공', resume });
  } catch (error) {
    next(error);
  }
});

//이력서 수정 api
router.patch('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { resumeId } = req.params;
    const { title, content } = req.body;

    const resume = await prisma.resumes.findFirst({
      where: { userId, resumeId: +resumeId },
    });

    if (!resume) {
      throw new Error('이력서가 존재하지 않습니다.');
    }

    if (!title && !content) {
      return res
        .status(400)
        .json({ errorMessage: '수정할 정보를 입력해주세요.' });
    }

    await joiSchemas.editSchema.validateAsync({ content });

    const updatedResume = await prisma.resumes.update({
      where: { userId, resumeId: +resumeId },
      data: {
        title,
        content,
      },
    });

    return res
      .status(201)
      .json({ message: '이력서 수정에 성공했습니다.', resume: updatedResume });
  } catch (error) {
    next(error);
  }
});

//이력서 삭제 api
router.delete('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { resumeId } = req.params;

    const resume = await prisma.resumes.findFirst({
      where: { userId, resumeId: +resumeId },
    });

    if (!resume) {
      throw new Error('이력서가 존재하지 않습니다.');
    }

    await prisma.resumes.delete({
      where: { userId, resumeId: +resumeId },
    });

    return res
      .status(200)
      .json({ message: '이력서 삭제에 성공했습니다.', resumeId });
  } catch (error) {
    next(error);
  }
});

//이력서 상태 수정 api
router.patch(
  '/resumes/:resumeId/status',
  authMiddleware,
  recruiterMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { resumeId } = req.params;
      const { status, reason } = req.body;
      const resume = await prisma.resumes.findFirst({
        where: { resumeId: +resumeId },
      });

      if (!resume) {
        throw new Error('이력서가 존재하지 않습니다.');
      }

      await joiSchemas.statusEdit.validateAsync({ status, reason });

      const [updatedResume, resumeHistory] = await prisma.$transaction(
        async (tx) => {
          const updatedResume = await tx.resumes.update({
            where: { resumeId: +resumeId },
            data: {
              status: status.toUpperCase(),
            },
          });

          const resumeHistory = await tx.resumeHistories.create({
            data: {
              recruiterId: userId,
              resumeId: +resumeId,
              oldStatus: resume.status,
              newStatus: status.toUpperCase(),
              reason,
            },
          });
          return [updatedResume, resumeHistory];
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        }
      );

      return res.status(201).json({
        message: '이력서 상태 변경에 성공했습니다.',
        data: resumeHistory,
      });
    } catch (error) {
      next(error);
    }
  }
);

//이력서 상태 수정 로그 조회 api
router.get(
  '/resumes/status/log',
  authMiddleware,
  recruiterMiddleware,
  async (req, res, next) => {
    const log = await prisma.resumeHistories.findMany({
      select: {
        resumeHistoryId: true,
        user: {
          select: {
            name: true,
          },
        },
        resumeId: true,
        oldStatus: true,
        newStatus: true,
        reason: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return res
      .status(200)
      .json({ message: '이력서 로그 조회에 성공했습니다.', log });
  }
);

export default router;
