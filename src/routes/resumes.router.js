import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma.utils.js';
import recruiterMiddleware from '../middlewares/recruiter.middleware.js';
import { Prisma } from '@prisma/client';
import { editStatusValidator } from '../middlewares/validators/editStatus-validator.middleware.js';
import { addResumeValidator } from '../middlewares/validators/addResume-validator.middleware.js';
import { editResumeValidator } from '../middlewares/validators/editResume-validator.middleware.js';
import { ResumesController } from '../controllers/resumes.controller.js';

const router = express.Router();
const resumesController = new ResumesController();

//이력서 생성 api === 리팩토링 완
router.post(
  '/resumes',
  authMiddleware,
  addResumeValidator,
  resumesController.createResume
);

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

//이력서 수정 api === 리팩토링 완
router.patch(
  '/resumes/:resumeId',
  authMiddleware,
  editResumeValidator,
  resumesController.editResume
);

//이력서 삭제 api 리팩토링 완
router.delete(
  '/resumes/:resumeId',
  authMiddleware,
  resumesController.deleteResume
);

//이력서 상태 수정 api
router.patch(
  '/resumes/:resumeId/status',
  authMiddleware,
  recruiterMiddleware,
  editStatusValidator,
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
