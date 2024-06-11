import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.utils.js';
import bcrypt from 'bcrypt';
import { REFRESH_TOKEN_SECRET_KEY } from '../constants/env.constant.js';
import { HttpError } from '../errors/http.error.js';
import { TokensRepository } from '../repositories/tokens.repository.js';

export default async function (req, res, next) {
  try {
    const tokensRepository = new TokensRepository(prisma);
    const authorization = req.headers['authorization'];
    if (!authorization) {
      throw new HttpError.Unauthorized('인증 정보가 없습니다.');
    }

    //일단 리프레시 토큰 가져와서 분리하기
    const [TokenType, token] = authorization.split(' ');

    if (TokenType !== 'Bearer') {
      throw new HttpError.Unauthorized('지원하지 않는 인증 방식입니다.');
    }

    //가져온 토큰
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET_KEY);

    const tokenInfo = await tokensRepository.findRefreshToken(payload.userId);

    if (!tokenInfo) {
      throw new HttpError.Unauthorized(
        '인증 정보와 일치하는 사용자가 없습니다.'
      );
    }

    const validToken = await bcrypt.compare(token, tokenInfo.token);

    if (!validToken) {
      throw new HttpError.Unauthorized('폐기 된 인증 정보입니다.');
    }

    req.user = tokenInfo;

    next();
  } catch (error) {
    next(error);
  }
}
