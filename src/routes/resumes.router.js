import express from 'express';
import { prisma } from '../utils/prisma.utils.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/recruiter.middleware.js';
import { editStatusValidator } from '../middlewares/validators/editStatus-validator.middleware.js';
import { addResumeValidator } from '../middlewares/validators/addResume-validator.middleware.js';
import { editResumeValidator } from '../middlewares/validators/editResume-validator.middleware.js';
import { ResumesController } from '../controllers/resumes.controller.js';
import { ResumesService } from '../services/resumes.service.js';
import { ResumesRepository } from '../repositories/resumes.repository.js';
import { ResumeHistoriesRepository } from '../repositories/resumeHistories.repository.js';

const router = express.Router();

const resumesRepository = new ResumesRepository(prisma);
const resumeHistoriesRepository = new ResumeHistoriesRepository(prisma);
const resumesService = new ResumesService(
  resumesRepository,
  resumeHistoriesRepository
);
const resumesController = new ResumesController(resumesService);

//이력서 생성 api === 리팩토링 완
router.post(
  '/resumes',
  authMiddleware,
  addResumeValidator,
  resumesController.createResume
);

//이력서 목록 조회 api === 리팩토링 완
router.get('/resumes', authMiddleware, resumesController.findAllResumes);

//이력서 상세 조회 api === 리팩토링 완
router.get('/resumes/:resumeId', authMiddleware, resumesController.findResume);

//이력서 수정 api === 리팩토링 완
router.patch(
  '/resumes/:resumeId',
  authMiddleware,
  editResumeValidator,
  resumesController.editResume
);

//이력서 삭제 api === 리팩토링 완
router.delete(
  '/resumes/:resumeId',
  authMiddleware,
  resumesController.deleteResume
);

//이력서 상태 수정 api === 리팩토링 트랜잭션 제외 완
router.patch(
  '/resumes/:resumeId/status',
  authMiddleware,
  requireRoles(['RECRUITER']),
  editStatusValidator,
  resumesController.updateResumeStatus
);

//이력서 상태 수정 로그 조회 api === 리팩토링 완
router.get(
  '/resumes/:resumeId/status/logs/',
  authMiddleware,
  requireRoles(['RECRUITER']),
  resumesController.checkStatusLogs
);

export default router;
