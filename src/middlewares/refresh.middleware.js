import dotEnv from 'dotenv';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.utils.js';

dotEnv.config();

export default async function (req, res, next) {
  try {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      return res.status(400).json({ errorMessage: '인증 정보가 없습니다.' });
    }
    const [TokenType, token] = authorization.split(' ');

    if (TokenType !== 'Bearer') {
      return res
        .status(400)
        .json({ errorMessage: '지원하지 않는 인증 방식입니다.' });
    }

    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY);
    console.log(payload);

    const user = await prisma.refresh_tokens.findFirst({
      where: { user_id: payload.userId },
    });

    if (!savedToken) {
      res.status(400).json({ errorMessage: '업슴' });
    }

    req.user = user;

    next();
  } catch (error) {
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
