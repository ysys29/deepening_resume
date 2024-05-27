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
    const { user_id } = req.user;
    const { title, content } = req.body;

    await joiSchemas.postSchema.validateAsync({ title, content });

    const resume = await prisma.resumes.create({
      data: {
        user_id,
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
    const { user_id, role } = req.user;
    const { sort, status } = req.query;

    const Sort = sort && sort.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const Status = status ? { status: status.toUpperCase() } : {};

    //로그인 한 사람이 recruiter일 때
    let Role = role !== 'RECRUITER' ? { user_id } : {};

    const resume = await prisma.resumes.findMany({
      where: { ...Role, ...Status },
      select: {
        resume_id: true,
        user: {
          select: {
            name: true,
          },
        },
        title: true,
        content: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: Sort,
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
router.get('/resumes/:resume_id', authMiddleware, async (req, res, next) => {
  try {
    const { user_id, role } = req.user;
    const { resume_id } = req.params;

    let Role =
      role !== 'RECRUITER'
        ? { user_id, resume_id: +resume_id }
        : { resume_id: +resume_id };

    const resume = await prisma.resumes.findFirst({
      where: Role,
      select: {
        resume_id: true,
        user: {
          select: {
            name: true,
          },
        },
        title: true,
        content: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!resume) {
      throw new Error('이력서가 존재하지 않습니다.');
    }

    return res
      .status(200)
      .json({ message: '이력서 상세 조회 성공', data: resume });
  } catch (error) {
    next(error);
  }
});

//이력서 수정 api
router.patch('/resumes/:resume_id', authMiddleware, async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const { resume_id } = req.params;
    const { title, content } = req.body;

    const resume = await prisma.resumes.findFirst({
      where: { user_id, resume_id: +resume_id },
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
      where: { user_id, resume_id: +resume_id },
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
router.delete('/resumes/:resume_id', authMiddleware, async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const { resume_id } = req.params;

    const resume = await prisma.resumes.findFirst({
      where: { user_id, resume_id: +resume_id },
    });

    if (!resume) {
      throw new Error('이력서가 존재하지 않습니다.');
    }

    await prisma.resumes.delete({
      where: { user_id, resume_id: +resume_id },
    });

    return res
      .status(200)
      .json({ message: '이력서 삭제에 성공했습니다.', resume_id });
  } catch (error) {
    next(error);
  }
});

//이력서 상태 수정 api
router.patch(
  '/resumes/:resume_id/status',
  authMiddleware,
  recruiterMiddleware,
  async (req, res, next) => {
    try {
      const { user_id } = req.user;
      const { resume_id } = req.params;
      const { status, reason } = req.body;
      const resume = await prisma.resumes.findFirst({
        where: { resume_id: +resume_id },
      });

      if (!resume) {
        throw new Error('이력서가 존재하지 않습니다.');
      }

      await joiSchemas.statusEdit.validateAsync({ status, reason });

      const [updatedResume, resumeHistory] = await prisma.$transaction(
        async (tx) => {
          const updatedResume = await tx.resumes.update({
            where: { resume_id: +resume_id },
            data: {
              status: status.toUpperCase(),
            },
          });

          const resumeHistory = await tx.resume_histories.create({
            data: {
              recruiter_id: user_id,
              resume_id: +resume_id,
              old_status: resume.status,
              new_status: status.toUpperCase(),
              reason,
            },
          });
          return [updatedResume, resumeHistory];
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        }
      );

      return res.status(200).json({
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
    const log = await prisma.resume_histories.findMany({
      select: {
        resume_history_id: true,
        user: {
          select: {
            name: true,
          },
        },
        resume_id: true,
        old_status: true,
        new_status: true,
        reason: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return res.status(200).json({ log });
  }
);

export default router;
