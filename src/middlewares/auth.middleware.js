import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET_KEY } from '../constants/env.constant.js';
import { HttpError } from '../errors/http.error.js';
import { UsersRepository } from '../repositories/users.repository.js';

export default async function (req, res, next) {
  try {
    const usersRepository = new UsersRepository();
    const authorization = req.headers['authorization'];

    if (!authorization) {
      throw new HttpError.Unauthorized('인증 정보가 없습니다.');
    }

    const [TokenType, token] = authorization.split(' ');

    if (TokenType !== 'Bearer') {
      throw new HttpError.Unauthorized('지원하지 않는 인증 방식입니다.');
    }

    const decodeToken = jwt.verify(token, ACCESS_TOKEN_SECRET_KEY);
    const userId = decodeToken.userId;

    const user = await usersRepository.findUserById(userId);

    if (!user) {
      throw new HttpError.Unauthorized(
        '인증 정보와 일치하는 사용자가 없습니다.'
      );
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}
