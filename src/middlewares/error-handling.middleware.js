import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';

export default function (err, req, res, next) {
  //joi 에러
  if (err.isJoi) {
    const errorMessage = err.details.map((detail) => detail.message);

    return res.status(HTTP_STATUS.BAD_REQUEST).json({ errorMessage });
  }

  //jwt 에러
  if (err.name === 'TokenExpiredError') {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ errorMessage: '인증 정보가 만료되었습니다.' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ errorMessage: '인증 정보가 유효하지 않습니다.' });
  }

  if (err instanceof HttpError.Unauthorized) {
    return res.status(err.status).json({ errorMessage: err.message });
  }

  if (err instanceof HttpError.Forbidden) {
    return res.status(err.status).json({ errorMessage: err.message });
  }

  if (err instanceof HttpError.BadRequest) {
    return res.status(err.status).json({ errorMessage: err.message });
  }

  if (err instanceof HttpError.NotFound) {
    return res.status(err.status).json({ errorMessage: err.message });
  }

  if (err.code === 'P2002') {
    //이메일 중복 에러
    return res
      .status(HTTP_STATUS.CONFLICT)
      .json({ errorMessage: '이미 가입 된 사용자입니다.' });
  }

  //기타 에러
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    errorMessage:
      err.message ??
      '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.',
  });
}
