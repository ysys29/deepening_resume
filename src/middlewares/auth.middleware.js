import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.utils.js';
import 'dotenv/config';
import { ACCESS_TOKEN_SECRET_KEY } from '../constants/env.constant.js';
import JwtError from '../constants/error.constant.js';

export default async function (req, res, next) {
  try {
    const authorization = req.headers['authorization'];

    if (!authorization) {
      throw new JwtError('인증 정보가 없습니다.');
    }

    const [TokenType, token] = authorization.split(' ');

    if (TokenType !== 'Bearer') {
      throw new JwtError('지원하지 않는 인증 방식입니다.');
    }

    const decodeToken = jwt.verify(token, ACCESS_TOKEN_SECRET_KEY);
    const user_id = decodeToken.user_id;

    const user = await prisma.users.findFirst({
      where: { user_id },
    });

    if (!user) {
      throw new JwtError('인증 정보와 일치하는 사용자가 없습니다.');
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}
