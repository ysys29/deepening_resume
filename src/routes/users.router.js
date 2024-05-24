import express from 'express';
import { prisma } from '../utils/prisma.utils.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth.middleware.js';
import joiSchemas from '../schemas/joi_schemas.js';
import refreshMiddleware from '../middlewares/refresh.middleware.js';
import dotEnv from 'dotenv';

dotEnv.config();

const router = express.Router();

//회원가입 api
router.post('/sign-up', async (req, res, next) => {
  try {
    const { email, password, verifyPassword, name } = req.body;

    await joiSchemas.signupSchema.validateAsync({
      email,
      password,
      verifyPassword,
      name,
    });

    if (password !== verifyPassword) {
      return res
        .status(400)
        .json({ errorMessage: '입력 한 두 비밀번호가 일치하지 않습니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

//엑세스 토큰 발급 함수
function createAccessToken(id) {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: '12h',
  });
}
//리프레시 토큰 발급 함수
function createRefreshToken(id) {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: '7d',
  });
}

//로그인 api
router.post('/sign-in', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    await joiSchemas.signinSchema.validateAsync({ email, password });

    const user = await prisma.users.findFirst({ where: { email } });
    console.log(user);
    if (!user) {
      return res
        .status(401)
        .json({ errorMessage: '인증 정보가 유효하지 않습니다.' });
    }
    let decodedPassword = await bcrypt.compare(password, user.password);
    if (!decodedPassword) {
      return res
        .status(401)
        .json({ errorMessage: '인증 정보가 유효하지 않습니다.' });
    }

    const accessToken = createAccessToken(user.userId);
    const refreshToken = createRefreshToken(user.userId);

    const hashedToken = await bcrypt.hash(refreshToken, 10);

    const tokenSave = await prisma.refresh_tokens.create({
      data: {
        user_id: user.userId,
        token: hashedToken,
      },
    });

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
    where: { userId: +userId },
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
    const { user_id, refresh_token_id } = req.user;
    const newAccessToken = createAccessToken(user_id);
    const newRefreshToken = createRefreshToken(user_id);

    const hashedToken = await bcrypt.hash(newRefreshToken, 10);

    await prisma.refresh_tokens.update({
      where: { refresh_token_id },
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
    const { user_id } = req.user;
    await prisma.refresh_tokens.deleteMany({ where: { user_id } });
    return res.status(200).json({ user_id });
  } catch (error) {
    next(error);
  }
});

export default router;
