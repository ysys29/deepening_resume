import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.utils.js';

export default async function (req, res, next) {
  try {
    const { authorization } = req.cookies;
    const [TokenType, token] = authorization.split(' ');

    if (!authorization) {
      return res.status(400).json({ errorMessage: '인증정보가 없습니다.' });
    }

    if (TokenType !== 'Bearer') {
      throw new Error('지원하지 않는 인증 방식입니다.');
    }

    const decodeToken = jwt.verify(token, 'user_secret_key');
    const userId = decodeToken.userId;

    const user = await prisma.users.findFirst({
      where: { userId: userId },
    });

    if (!user) {
      res.clearCookie('authorization');
      throw new Error('인증 정보와 일치하는 사용자가 없습니다.');
    }

    req.user = user;

    next();
  } catch (error) {
    res.clearCookie('authorization');
    switch (error.name) {
      case 'TokenExpiredError':
        return res
          .status(401)
          .json({ errorMessage: '인증 정보가 만료되었습니다.' });
      case 'JsonWebTokenError':
        return res
          .status(401)
          .json({ errorMessage: '인증 정보가 유효하지 않습니다.' });
      default:
        next(error);
    }
  }
}
