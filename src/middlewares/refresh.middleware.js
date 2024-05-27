import dotEnv from 'dotenv';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.utils.js';
import bcrypt from 'bcrypt';
import { REFRESH_TOKEN_SECRET_KEY } from '../constants/env.constant.js';

dotEnv.config();

export default async function (req, res, next) {
  try {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      return res.status(401).json({ errorMessage: '인증 정보가 없습니다.' });
    }

    //일단 리프레시 토큰 가져와서 분리하기
    const [TokenType, token] = authorization.split(' ');

    if (TokenType !== 'Bearer') {
      return res
        .status(401)
        .json({ errorMessage: '지원하지 않는 인증 방식입니다.' });
    }

    //가져온 토큰
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET_KEY);
    if (!payload) {
      return res
        .status(401)
        .json({ errorMessage: '인증정보가 유효하지 않습니다.' });
    }

    const user = await prisma.refresh_tokens.findFirst({
      where: { user_id: payload.user_id },
    });

    if (!user) {
      return res
        .status(401)
        .json({ errorMessage: '인증 정보와 일치하는 사용자가 없습니다.' });
    }

    const validToken = await bcrypt.compare(token, user.token);

    if (!validToken) {
      return res.status(401).json({ errorMessage: '폐기 된 인증 정보입니다.' });
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}
