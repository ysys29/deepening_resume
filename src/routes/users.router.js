import express from 'express';
import { prisma } from '../utils/prisma.utils.js';
import bcrypt from 'bcrypt';
import authMiddleware from '../middlewares/auth.middleware.js';
import refreshMiddleware from '../middlewares/refresh.middleware.js';
import { saltHash } from '../constants/hash.constant.js';
import { createAccessToken, createRefreshToken } from '../utils/tokens.js';
import { signUpValidator } from '../middlewares/validators/signUp-validator.middleware.js';
import { signInValidator } from '../middlewares/validators/signIn-validator.middleware.js';

const router = express.Router();

//회원가입 api
router.post('/sign-up', signUpValidator, async (req, res, next) => {
  try {
    const { email, password, verifyPassword, name } = req.body;

    if (password !== verifyPassword) {
      return res
        .status(400)
        .json({ errorMessage: '입력 한 두 비밀번호가 일치하지 않습니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, saltHash);

    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const { password: _, ...resUser } = user;

    return res
      .status(201)
      .json({ message: '회원가입이 완료되었습니다.', user: resUser });
  } catch (error) {
    next(error);
  }
});

//로그인 api
router.post('/sign-in', signInValidator, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findFirst({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ errorMessage: '인증 정보가 유효하지 않습니다.' });
    }
    const decodedPassword = await bcrypt.compare(password, user.password);
    if (!decodedPassword) {
      return res
        .status(401)
        .json({ errorMessage: '인증 정보가 유효하지 않습니다.' });
    }

    //엑세스 토큰 발급
    const accessToken = createAccessToken(user.userId);
    //리프레시 토큰 발급
    const refreshToken = createRefreshToken(user.userId);

    //리프레시 토큰 암호화
    const hashedToken = await bcrypt.hash(refreshToken, saltHash);

    //여기서 저장소에 해당 아이디의 토큰이 있는지 확인
    const savedToken = await prisma.refreshTokens.findFirst({
      where: { userId: user.userId },
    });

    //없으면 토큰 생성, 있으면 토큰 업데이트
    if (!savedToken) {
      await prisma.refreshTokens.create({
        data: {
          userId: user.userId,
          token: hashedToken,
        },
      });
    } else {
      await prisma.refreshTokens.update({
        where: { userId: user.userId },
        data: { token: hashedToken },
      });
    }

    return res
      .status(200)
      .json({ message: '로그인에 성공했습니다.', accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

//내 정보 조회 api
router.get('/users', authMiddleware, async (req, res, next) => {
  const { userId } = req.user;

  const user = await prisma.users.findFirst({
    where: { userId },
    select: {
      userId: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ message: '내 정보 조회에 성공했습니다', user });
});

//토큰 재발급 api
router.post('/token', refreshMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const newAccessToken = createAccessToken(userId);
    const newRefreshToken = createRefreshToken(userId);

    const hashedToken = await bcrypt.hash(newRefreshToken, saltHash);

    await prisma.refreshTokens.update({
      where: { userId },
      data: {
        token: hashedToken,
      },
    });
    return res.status(200).json({ newAccessToken, newRefreshToken });
  } catch (error) {
    next(error);
  }
});

//로그아웃 api
router.delete('/token', refreshMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    await prisma.refreshTokens.delete({ where: { userId } });
    return res
      .status(200)
      .json({ message: '로그아웃을 완료했습니다.', userId });
  } catch (error) {
    next(error);
  }
});

export default router;
