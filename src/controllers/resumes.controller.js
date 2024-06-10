import { ResumesService } from '../services/resumes.service.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';

export class ResumesController {
  resumesService = new ResumesService();

  createResume = async (req, res, next) => {
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
  };
}
