import { ResumesService } from '../services/resumes.service.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';

export class ResumesController {
  resumesService = new ResumesService();

  //이력서 생성
  createResume = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { title, content } = req.body;

      const resume = await this.resumesService.createResume(
        userId,
        title,
        content
      );

      return res
        .status(HTTP_STATUS.CREATED)
        .json({ message: '이력서를 생성했습니다.', data: resume });
    } catch (error) {
      next(error);
    }
  };

  //이력서 조회
  findAllResumes = async (req, res, next) => {
    try {
      const { userId, role } = req.user;
      const { sort } = req.query;
      const resumes = await this.resumesService.findAllResumes(
        userId,
        role,
        sort
      );

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: '이력서 목록', data: resumes });
    } catch (error) {
      next(error);
    }
  };

  //   //이력서 상세 조회
  //   findPost = async (req, res, next) => {
  //     try {
  //       const { userId, role } = req.user;
  //       const resumeId = +req.params.resumeId;

  //       const resume = await this.resumesService.findResume(resumeId);

  //       return res
  //         .status(HTTP_STATUS.OK)
  //         .json({ message: `${resumeId}번 이력서`, data: resume });
  //     } catch (error) {
  //       next(error);
  //     }
  //   };

  //이력서 수정
  editResume = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const resumeId = +req.params.resumeId;
      const { title, content } = req.body;

      const resume = await this.resumesService.findResume(resumeId);

      const updatedResume = await this.resumesService.updateResume(
        userId,
        resume,
        title,
        content
      );

      return res
        .status(HTTP_STATUS.CREATED)
        .json({ message: '이력서를 수정했습니다.', data: updatedResume });
    } catch (error) {
      next(error);
    }
  };

  //이력서 삭제
  deleteResume = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const resumeId = +req.params.resumeId;

      const resume = await this.resumesService.findResume(resumeId);

      await this.resumesService.deleteResume(userId, resume);

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: '이력서 삭제에 성공했습니다.', resumeId });
    } catch (error) {
      next(error);
    }
  };

  //이력서 상태 수정 로그 조회
  checkStatusLogs = async (req, res, next) => {
    try {
      const resumeId = +req.params.resumeId;

      const logs = await this.resumesService.findStatusLogs(resumeId);

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: `${resumeId}번 이력서의 상태 변경 이력`, data: logs });
    } catch (error) {
      next(error);
    }
  };
}
