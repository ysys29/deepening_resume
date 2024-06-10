import express from 'express';
import { prisma } from '../utils/prisma.utils.js';
import bcrypt from 'bcrypt';
import authMiddleware from '../middlewares/auth.middleware.js';
import refreshMiddleware from '../middlewares/refresh.middleware.js';
import { saltHash } from '../constants/hash.constant.js';
import { createAccessToken, createRefreshToken } from '../utils/tokens.js';
import { signUpValidator } from '../middlewares/validators/signUp-validator.middleware.js';
import { signInValidator } from '../middlewares/validators/signIn-validator.middleware.js';
import { UsersController } from '../controllers/users.controller.js';

const router = express.Router();
const usersController = new UsersController();

//회원가입 api === 리팩토링 중
router.post('/sign-up', signUpValidator, usersController.createUser);

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

//내 정보 조회 api === 리팩토링 완
router.get('/users', authMiddleware, usersController.getUserById);

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
