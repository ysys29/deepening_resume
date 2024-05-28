import JwtError from '../errors/jwt.error.js';

export default function (err, req, res, next) {
  //joi 에러
  if (err.isJoi) {
    const errorMessage = err.details.map((detail) => detail.message);

    return res.status(400).json({ errorMessage });
  }

  //jwt 에러
  if (err.name === 'TokenExpiredError') {
    return res
      .status(401)
      .json({ errorMessage: '인증 정보가 만료되었습니다.' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res
      .status(401)
      .json({ errorMessage: '인증 정보가 유효하지 않습니다.' });
  }

  if (err instanceof JwtError) {
    return res.status(err.statusCode).json({ errorMessage: err.message });
  }

  //이메일 중복 에러
  if (err.code === 'P2002') {
    return res.status(400).json({ errorMessage: '이미 가입 된 사용자입니다.' });
  }

  //이력서 존재x 에러
  if (err.message === '이력서가 존재하지 않습니다.') {
    return res
      .status(400)
      .json({ errorMessage: '이력서가 존재하지 않습니다.' });
  }

  //기타 에러
  return res.status(500).json({
    errorMessage:
      err.message ??
      '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.',
  });
}
