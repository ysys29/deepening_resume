import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.utils.js';

export default async function (req, res, next) {
  try {
    const { authorization } = req.cookies;
    const [TokenType, token] = authorization.split(' ');

    if (TokenType !== 'Bearer') {
      throw new Error('토큰 타입이 일치하지 않습니다.');
    }

    const decodeToken = jwt.verify(token, 'user_secret_key');
    const userId = decodeToken.userId;

    const user = await prisma.users.findFirst({
      where: { userId: userId },
    });

    if (!user) {
      throw new Error('토큰 사용자가 존재하지 않습니다.');
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(400).json({ errorMessage: '에러' });
  }
}
