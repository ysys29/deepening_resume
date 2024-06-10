import express from 'express';
import { prisma } from '../utils/prisma.utils.js';
import bcrypt from 'bcrypt';
import authMiddleware from '../middlewares/auth.middleware.js';
import refreshMiddleware from '../middlewares/refresh.middleware.js';
import { saltHashRound } from '../constants/hash.constant.js';
import { createAccessToken, createRefreshToken } from '../utils/tokens.js';
import { signUpValidator } from '../middlewares/validators/signUp-validator.middleware.js';
import { signInValidator } from '../middlewares/validators/signIn-validator.middleware.js';
import { UsersController } from '../controllers/users.controller.js';

const router = express.Router();
const usersController = new UsersController();

//회원가입 api === 리팩토링 완
router.post('/sign-up', signUpValidator, usersController.createUser);

//로그인 api === 리팩토링 완
router.post('/sign-in', signInValidator, usersController.loginUser);

//내 정보 조회 api === 리팩토링 완
router.get('/users', authMiddleware, usersController.getUserById);

//토큰 재발급 api
router.post('/token', refreshMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const newAccessToken = createAccessToken(userId);
    const newRefreshToken = createRefreshToken(userId);

    const hashedToken = await bcrypt.hash(newRefreshToken, saltHashRound);

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
